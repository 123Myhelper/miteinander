'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const executor = require('./isolated-care-needs-taxonomy');

const targetArgs = [
  '--expected-db-host=db.internal.example',
  '--expected-db-port=3306',
  '--expected-db-name=myhelper',
];

function baselineRows() {
  const generic = {
    label_en: 'unchanged en',
    label_de: 'unverändert de',
    label_fr: 'inchangé fr',
    description_en: 'unchanged description en',
    description_de: 'unveränderte Beschreibung de',
    description_fr: 'description inchangée fr',
  };
  return executor.AFFECTED_KEYS.map((key, index) => ({
    id: index + 1,
    key,
    is_active: 1,
    ...generic,
    ...executor.PRECONDITIONS[key],
  }));
}

test('defaults to plan mode and requires an explicit target identity', () => {
  const options = executor.parseArgs(targetArgs);
  assert.equal(options.mode, 'plan');
  assert.equal(options.expectedHost, 'db.internal.example');
  assert.equal(options.expectedPort, 3306);
  assert.equal(options.expectedDatabase, 'myhelper');
  assert.throws(() => executor.parseArgs([]), /expected-db-host/);
});

test('rejects ambiguous modes, unknown options, duplicate options, and invalid ports', () => {
  assert.throws(() => executor.parseArgs(['--plan', '--execute', ...targetArgs]), /mutually exclusive/);
  assert.throws(() => executor.parseArgs([...targetArgs, '--unknown=value']), /unknown option/);
  assert.throws(() => executor.parseArgs([...targetArgs, '--expected-db-name=other']), /more than once/);
  assert.throws(
    () => executor.parseArgs(['--expected-db-host=x', '--expected-db-port=0', '--expected-db-name=y']),
    /out of range/
  );
});

test('approved migration is a regular file with the pinned checksum and contract', () => {
  assert.equal(executor.checksumApprovedMigration(), executor.APPROVED_SHA256);
  const migration = executor.loadApprovedMigration();
  assert.equal(typeof migration.up, 'function');
  assert.equal(typeof migration.down, 'function');
});

test('the exact verified bytes are the bytes compiled', () => {
  const bytes = Buffer.from("module.exports = { value: 'verified' };\n", 'utf8');
  const digest = require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  const loaded = executor.compileVerifiedCommonJs(bytes, digest, '/virtual/verified-migration.js');
  assert.equal(loaded.value, 'verified');
  assert.throws(
    () => executor.compileVerifiedCommonJs(Buffer.from("module.exports = { value: 'changed' };\n"), digest, '/virtual/changed.js'),
    /checksum mismatch/
  );
});

test('preconditions fail closed on missing, duplicate, unexpected, or changed rows', () => {
  const rows = baselineRows();
  assert.doesNotThrow(() => executor.assertExpectedRows(rows, executor.PRECONDITIONS, 'precondition'));
  assert.throws(() => executor.assertExpectedRows(rows.slice(1), executor.PRECONDITIONS, 'precondition'), /exactly/);
  assert.throws(
    () => executor.assertExpectedRows([...rows.slice(0, -1), { ...rows[0] }], executor.PRECONDITIONS, 'precondition'),
    /duplicate/
  );
  const changed = rows.map((row) => ({ ...row }));
  changed.find((row) => row.key === 'mobility').label_de = 'drift';
  assert.throws(() => executor.assertExpectedRows(changed, executor.PRECONDITIONS, 'precondition'), /mismatch/);
});

test('postconditions preserve IDs and all unspecified fields', () => {
  const before = baselineRows();
  const after = before.map((row) => ({ ...row, ...executor.POSTCONDITIONS[row.key] }));
  assert.doesNotThrow(() => executor.assertPostRows(before, after));
  const changedId = after.map((row) => ({ ...row }));
  changedId[0].id = 999;
  assert.throws(() => executor.assertPostRows(before, changedId), /id changed/);
  const collateralChange = after.map((row) => ({ ...row }));
  collateralChange.find((row) => row.key === 'medication').label_en = 'collateral';
  assert.throws(() => executor.assertPostRows(before, collateralChange), /unexpected change/);
});

test('reference validation rejects malformed JSON and unknown or non-integer IDs', () => {
  const validIds = new Set([1, 2, 3]);
  assert.doesNotThrow(() => executor.validateReferences([{ id: 1, selections: '[1,2]' }], validIds, 'refs'));
  assert.throws(() => executor.validateReferences([{ id: 1, selections: '{' }], validIds, 'refs'), /invalid JSON/);
  assert.throws(() => executor.validateReferences([{ id: 1, selections: '[4]' }], validIds, 'refs'), /invalid taxonomy id/);
  assert.throws(() => executor.validateReferences([{ id: 1, selections: '["1"]' }], validIds, 'refs'), /invalid taxonomy id/);
});

test('execution environment must match the explicit target and checksum interlock', () => {
  const options = executor.parseArgs(targetArgs);
  const validEnvironment = {
    ALLOW_ISOLATED_TAXONOMY_MIGRATION: executor.EXECUTION_INTERLOCK,
    DB_HOST: options.expectedHost,
    DB_PORT: String(options.expectedPort),
    DB_NAME: options.expectedDatabase,
    DB_USER: 'operator',
    DB_PASSWORD: 'secret',
  };
  assert.doesNotThrow(() => executor.requireExecutionEnvironment(options, validEnvironment));
  assert.throws(
    () => executor.requireExecutionEnvironment(options, { ...validEnvironment, DB_NAME: 'wrong' }),
    /DB_NAME mismatch/
  );
  assert.throws(
    () => executor.requireExecutionEnvironment(options, { ...validEnvironment, ALLOW_ISOLATED_TAXONOMY_MIGRATION: '' }),
    /interlock/
  );
});

test('writable tables must all use an explicitly approved transactional engine', () => {
  assert.doesNotThrow(() => executor.assertTransactionalEngines([
    { table_name: 'care_needs', engine: 'InnoDB' },
    { table_name: 'migration_meta', engine: 'InnoDB' },
  ]));
  assert.throws(
    () => executor.assertTransactionalEngines([{ table_name: 'care_needs', engine: 'InnoDB' }]),
    /missing for migration_meta/
  );
  assert.throws(
    () => executor.assertTransactionalEngines([
      { table_name: 'care_needs', engine: 'MyISAM' },
      { table_name: 'migration_meta', engine: 'InnoDB' },
    ]),
    /care_needs must use an approved transactional storage engine/
  );
});

test('post-commit recovery preserves every cause and reports committed success', () => {
  const receiptError = new Error('disk full');
  const closeError = new Error('close timeout');
  const error = new executor.PostCommitRecoveryError('receipt generation', receiptError);
  error.addIssue('connection cleanup', closeError);
  const message = executor.formatCliFailure(error);
  assert.equal(error.issues[0].cause, receiptError);
  assert.equal(error.issues[1].cause, closeError);
  assert.equal(error.databaseCommitted, true);
  assert.equal(executor.exitCodeForFailure(error), executor.POST_COMMIT_RECOVERY_EXIT_CODE);
  assert.equal(executor.POST_COMMIT_RECOVERY_EXIT_CODE, 2);
  assert.match(message, /SUCCESS WITH RECOVERY ACTION REQUIRED/);
  assert.match(message, /receipt generation failed: disk full/);
  assert.match(message, /connection cleanup failed: close timeout/);
  assert.match(message, /Do NOT rerun the migration/);
  assert.doesNotMatch(message, /FAILURE BEFORE COMMIT/);
});

test('ambiguous commit acknowledgement has a distinct unknown state and exit status', () => {
  const commitError = new Error('connection lost during COMMIT');
  const cleanupError = new Error('socket close failed');
  const error = new executor.UnknownCommitStateError(commitError);
  error.cleanupErrors.push(cleanupError);
  const message = executor.formatCliFailure(error);
  assert.equal(error.cause, commitError);
  assert.equal(executor.exitCodeForFailure(error), executor.UNKNOWN_COMMIT_STATE_EXIT_CODE);
  assert.equal(executor.UNKNOWN_COMMIT_STATE_EXIT_CODE, 3);
  assert.match(message, /UNKNOWN COMMIT STATE/);
  assert.match(message, /connection lost during COMMIT/);
  assert.match(message, /DO NOT rerun/);
  assert.match(message, /Verify migration_meta independently/);
  assert.doesNotMatch(message, /FAILURE BEFORE COMMIT/);
});

test('pre-commit errors remain classified as failure before commit', () => {
  const error = new Error('precondition mismatch');
  error.rollbackError = new Error('rollback transport failure');
  const message = executor.formatCliFailure(error);
  assert.equal(executor.exitCodeForFailure(error), 1);
  assert.match(message, /FAILURE BEFORE COMMIT/);
  assert.match(message, /Rollback also failed/);
  assert.doesNotMatch(message, /SUCCESS/);
  assert.doesNotMatch(message, /UNKNOWN COMMIT STATE/);
});

test('source is path-pinned and contains no migration-directory enumeration or protected migration reference', () => {
  const sourcePath = path.join(__dirname, 'isolated-care-needs-taxonomy.js');
  const source = fs.readFileSync(sourcePath, 'utf8');
  assert.equal(source.includes('readdirSync'), false);
  assert.equal(source.includes('migrations/runner'), false);
  assert.equal(source.includes('runner.js'), false);
  assert.equal(source.includes('20260711'), false);
  assert.equal(source.includes('require(APPROVED_MIGRATION_PATH)'), false);
  assert.equal(source.includes('O_NOFOLLOW'), true);
  assert.equal((source.match(/20260710000001_align_care_needs_taxonomy\.js/g) || []).length, 1);
});
