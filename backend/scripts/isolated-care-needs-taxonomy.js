#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const Module = require('module');
const path = require('path');

const MIGRATION_NAME = '20260710000001_align_care_needs_taxonomy.js';
const APPROVED_SHA256 = '5a2895dbe1381fa1b7f685a91faba769ba6d1c7a1ca48d83a94e7a24c800aff5';
const APPROVED_MIGRATION_PATH = path.resolve(
  __dirname,
  '..',
  'src',
  'migrations',
  'files',
  MIGRATION_NAME
);
const EXECUTION_CONFIRMATION = `EXECUTE_${MIGRATION_NAME}`;
const EXECUTION_INTERLOCK = `ALLOW_${APPROVED_SHA256}`;
const POST_COMMIT_RECOVERY_EXIT_CODE = 2;
const UNKNOWN_COMMIT_STATE_EXIT_CODE = 3;
const WRITABLE_TABLES = ['care_needs', 'migration_meta'];
const ALLOWED_TRANSACTIONAL_ENGINES = new Set(['innodb']);
const AFFECTED_KEYS = [
  'dailyLiving',
  'housekeeping',
  'mealPreparation',
  'medication',
  'mobility',
  'personalHygiene',
];
const ROW_COLUMNS = [
  'id',
  'key',
  'label_en',
  'label_de',
  'label_fr',
  'description_en',
  'description_de',
  'description_fr',
  'is_active',
];
const ROW_SELECT_LIST = 'id, `key`, label_en, label_de, label_fr, description_en, description_de, description_fr, is_active';

const PRECONDITIONS = {
  medication: { is_active: true },
  personalHygiene: { is_active: true },
  mealPreparation: { is_active: true },
  mobility: {
    label_en: 'Mobility Assistance',
    label_de: 'Mobilitätshilfe',
    label_fr: 'Aide À La Mobilité',
    description_en: 'Help with walking, transfers, and physical movement',
    description_de: 'Hilfe beim Gehen, Transfers und körperlicher Bewegung',
    description_fr: 'Aide à la marche, aux transferts et aux mouvements physiques',
  },
  dailyLiving: {
    label_fr: 'Activités Quotidiennes',
    description_en: 'Assistance with daily activities like eating, dressing, and bathing',
    description_de: 'Unterstützung bei täglichen Aktivitäten wie Essen, Anziehen und Baden',
    description_fr: "Aide aux activités quotidiennes comme manger, s'habiller et se laver",
  },
  housekeeping: { label_fr: 'Entretien Ménager' },
};

const POSTCONDITIONS = {
  medication: { is_active: false },
  personalHygiene: { is_active: false },
  mealPreparation: { is_active: false },
  mobility: {
    label_en: 'Getting Out & About',
    label_de: 'Begleitung unterwegs',
    label_fr: 'Accompagnement en déplacement',
    description_en: 'Support with walks, appointments, errands, and everyday outings',
    description_de: 'Unterstützung bei Spaziergängen, Terminen, Besorgungen und alltäglichen Ausflügen',
    description_fr: 'Aide pour les promenades, rendez-vous, courses et sorties quotidiennes',
  },
  dailyLiving: {
    label_fr: 'Activités quotidiennes',
    description_en: 'Assistance with daily activities like eating and dressing',
    description_de: 'Unterstützung bei täglichen Aktivitäten wie Essen und Anziehen',
    description_fr: "Aide aux activités quotidiennes comme manger et s'habiller",
  },
  housekeeping: { label_fr: 'Entretien ménager' },
};

class PostCommitRecoveryError extends Error {
  constructor(kind, cause) {
    super(`database committed; ${kind} failed`, { cause });
    this.name = 'PostCommitRecoveryError';
    this.databaseCommitted = true;
    this.exitCode = POST_COMMIT_RECOVERY_EXIT_CODE;
    this.issues = [{ kind, cause }];
  }

  addIssue(kind, cause) {
    this.issues.push({ kind, cause });
  }
}

class UnknownCommitStateError extends Error {
  constructor(cause) {
    super('commit acknowledgement failed; the database commit state is unknown', { cause });
    this.name = 'UnknownCommitStateError';
    this.commitStateUnknown = true;
    this.exitCode = UNKNOWN_COMMIT_STATE_EXIT_CODE;
    this.cleanupErrors = [];
  }
}

function fail(message) {
  throw new Error(message);
}

function parsePort(value, label) {
  if (!/^\d+$/.test(String(value || ''))) fail(`${label} must be an integer`);
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) fail(`${label} is out of range`);
  return port;
}

function parseArgs(argv) {
  const values = {};
  let mode = 'plan';

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--plan') {
      if (mode === 'execute') fail('--plan and --execute are mutually exclusive');
      mode = 'plan';
      continue;
    }
    if (argument === '--execute') {
      if (argv.includes('--plan')) fail('--plan and --execute are mutually exclusive');
      mode = 'execute';
      continue;
    }
    if (!argument.startsWith('--')) fail(`unexpected positional argument: ${argument}`);

    const equalsIndex = argument.indexOf('=');
    const name = argument.slice(2, equalsIndex === -1 ? undefined : equalsIndex);
    const inlineValue = equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1);
    const value = inlineValue === undefined ? argv[++index] : inlineValue;
    if (!value || value.startsWith('--')) fail(`--${name} requires a value`);
    if (Object.hasOwn(values, name)) fail(`--${name} was provided more than once`);
    values[name] = value;
  }

  const allowed = new Set([
    'expected-db-host',
    'expected-db-port',
    'expected-db-name',
    'approval-reference',
    'backup-reference',
    'backup-verified-at',
    'snapshot-output',
    'confirm',
  ]);
  for (const name of Object.keys(values)) {
    if (!allowed.has(name)) fail(`unknown option: --${name}`);
  }

  for (const name of ['expected-db-host', 'expected-db-port', 'expected-db-name']) {
    if (!values[name]) fail(`--${name} is required in ${mode} mode`);
  }

  const options = {
    mode,
    expectedHost: values['expected-db-host'],
    expectedPort: parsePort(values['expected-db-port'], '--expected-db-port'),
    expectedDatabase: values['expected-db-name'],
    approvalReference: values['approval-reference'],
    backupReference: values['backup-reference'],
    backupVerifiedAt: values['backup-verified-at'],
    snapshotOutput: values['snapshot-output'],
    confirmation: values.confirm,
  };

  if (mode === 'execute') validateExecutionArguments(options);
  return options;
}

function validateIdentifier(value, label) {
  if (!/^[A-Za-z0-9_.:-]+$/.test(value || '')) {
    fail(`${label} contains unsupported characters`);
  }
}

function validateExecutionArguments(options, now = new Date()) {
  for (const [value, label] of [
    [options.approvalReference, '--approval-reference'],
    [options.backupReference, '--backup-reference'],
  ]) {
    validateIdentifier(value, label);
  }
  if (options.confirmation !== EXECUTION_CONFIRMATION) {
    fail(`--confirm must equal ${EXECUTION_CONFIRMATION}`);
  }
  const backupTime = new Date(options.backupVerifiedAt || 'invalid');
  if (Number.isNaN(backupTime.getTime())) fail('--backup-verified-at must be an ISO-8601 timestamp');
  const ageMs = now.getTime() - backupTime.getTime();
  if (ageMs < 0 || ageMs > 24 * 60 * 60 * 1000) {
    fail('backup verification must be no more than 24 hours old and not in the future');
  }
  if (!options.snapshotOutput || !path.isAbsolute(options.snapshotOutput)) {
    fail('--snapshot-output must be an absolute path');
  }
  const parent = path.dirname(options.snapshotOutput);
  if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) {
    fail('--snapshot-output parent directory must already exist');
  }
  if (fs.existsSync(options.snapshotOutput) || fs.existsSync(`${options.snapshotOutput}.committed.json`)) {
    fail('snapshot or commit receipt already exists; refusing to overwrite evidence');
  }
}

function readApprovedMigrationBytes() {
  if (typeof fs.constants.O_NOFOLLOW !== 'number') {
    fail('this platform cannot enforce no-follow migration loading');
  }
  let descriptor;
  try {
    descriptor = fs.openSync(
      APPROVED_MIGRATION_PATH,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW
    );
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) fail('approved migration path must resolve to a regular file');
    return fs.readFileSync(descriptor);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function verifyDigest(bytes, expectedDigest = APPROVED_SHA256) {
  if (!Buffer.isBuffer(bytes)) fail('migration source must be a byte buffer');
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest !== expectedDigest) fail(`migration checksum mismatch: received ${digest}`);
  return digest;
}

function compileVerifiedCommonJs(bytes, expectedDigest, filename) {
  verifyDigest(bytes, expectedDigest);
  const loadedModule = new Module(filename, module);
  loadedModule.filename = filename;
  loadedModule.paths = Module._nodeModulePaths(path.dirname(filename));
  loadedModule._compile(bytes.toString('utf8'), filename);
  return loadedModule.exports;
}

function checksumApprovedMigration() {
  return verifyDigest(readApprovedMigrationBytes());
}

function loadApprovedMigration() {
  const bytes = readApprovedMigrationBytes();
  const migration = compileVerifiedCommonJs(bytes, APPROVED_SHA256, APPROVED_MIGRATION_PATH);
  if (!migration || typeof migration.up !== 'function' || typeof migration.down !== 'function') {
    fail('approved migration does not expose the expected up/down contract');
  }
  return migration;
}

function normalizeRow(row) {
  const normalized = {};
  for (const column of ROW_COLUMNS) normalized[column] = row[column];
  normalized.is_active = Boolean(normalized.is_active);
  return normalized;
}

function rowsByKey(rows) {
  if (!Array.isArray(rows) || rows.length !== AFFECTED_KEYS.length) {
    fail(`expected exactly ${AFFECTED_KEYS.length} affected taxonomy rows`);
  }
  const map = new Map();
  for (const rawRow of rows) {
    const row = normalizeRow(rawRow);
    if (!AFFECTED_KEYS.includes(row.key)) fail(`unexpected taxonomy key: ${row.key}`);
    if (map.has(row.key)) fail(`duplicate taxonomy key: ${row.key}`);
    if (!Number.isInteger(Number(row.id)) || Number(row.id) < 1) fail(`invalid id for ${row.key}`);
    row.id = Number(row.id);
    map.set(row.key, row);
  }
  for (const key of AFFECTED_KEYS) if (!map.has(key)) fail(`missing taxonomy key: ${key}`);
  return map;
}

function assertExpectedRows(rows, expectations, phase) {
  const map = rowsByKey(rows);
  for (const [key, expected] of Object.entries(expectations)) {
    const row = map.get(key);
    for (const [field, value] of Object.entries(expected)) {
      if (row[field] !== value) {
        fail(`${phase} mismatch for ${key}.${field}`);
      }
    }
  }
  return map;
}

function assertPostRows(preRows, postRows) {
  const before = rowsByKey(preRows);
  const after = assertExpectedRows(postRows, POSTCONDITIONS, 'postcondition');
  for (const key of AFFECTED_KEYS) {
    const oldRow = before.get(key);
    const newRow = after.get(key);
    if (oldRow.id !== newRow.id) fail(`id changed for ${key}`);
    const changedFields = new Set(Object.keys(POSTCONDITIONS[key]));
    for (const column of ROW_COLUMNS) {
      if (!changedFields.has(column) && oldRow[column] !== newRow[column]) {
        fail(`unexpected change to ${key}.${column}`);
      }
    }
  }
}

function stableDigest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function validateReferences(rows, validIds, label) {
  const normalized = rows
    .map((row) => {
      let values = row.selections;
      if (typeof values === 'string') {
        try {
          values = JSON.parse(values);
        } catch {
          fail(`${label} row ${row.id} contains invalid JSON`);
        }
      }
      if (!Array.isArray(values)) fail(`${label} row ${row.id} is not a JSON array`);
      for (const value of values) {
        if (!Number.isInteger(value) || !validIds.has(value)) {
          fail(`${label} row ${row.id} contains an invalid taxonomy id`);
        }
      }
      return { id: Number(row.id), selections: values };
    })
    .sort((left, right) => left.id - right.id);
  return { rowCount: normalized.length, digest: stableDigest(normalized) };
}

function assertSameDigest(before, after, label) {
  if (before.rowCount !== after.rowCount || before.digest !== after.digest) {
    fail(`${label} changed during taxonomy migration`);
  }
}

function assertTransactionalEngines(rows) {
  if (!Array.isArray(rows)) fail('storage-engine metadata is not an array');
  const engines = new Map();
  for (const row of rows) {
    const table = row.table_name;
    if (!WRITABLE_TABLES.includes(table)) fail(`unexpected writable table metadata: ${table}`);
    if (engines.has(table)) fail(`duplicate storage-engine metadata for ${table}`);
    engines.set(table, String(row.engine || '').toLowerCase());
  }
  for (const table of WRITABLE_TABLES) {
    if (!engines.has(table)) fail(`storage-engine metadata is missing for ${table}`);
    const engine = engines.get(table);
    if (!ALLOWED_TRANSACTIONAL_ENGINES.has(engine)) {
      fail(`${table} must use an approved transactional storage engine; received ${engine || 'unknown'}`);
    }
  }
}

function writeExclusiveJson(filename, value) {
  const descriptor = fs.openSync(filename, 'wx', 0o600);
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function requireExecutionEnvironment(options, env) {
  if (env.ALLOW_ISOLATED_TAXONOMY_MIGRATION !== EXECUTION_INTERLOCK) {
    fail('execution environment interlock is absent or incorrect');
  }
  for (const name of ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (!env[name]) fail(`${name} must be explicitly set; defaults are forbidden`);
  }
  if (env.DB_HOST.toLowerCase() !== options.expectedHost.toLowerCase()) fail('DB_HOST mismatch');
  if (parsePort(env.DB_PORT, 'DB_PORT') !== options.expectedPort) fail('DB_PORT mismatch');
  if (env.DB_NAME !== options.expectedDatabase) fail('DB_NAME mismatch');
}

async function selectTaxonomyRows(sequelize, transaction, lock = true) {
  const lockClause = lock ? ' FOR UPDATE' : '';
  const [rows] = await sequelize.query(
    `SELECT id, \`key\`, label_en, label_de, label_fr, description_en, description_de, description_fr, is_active
       FROM care_needs
      WHERE \`key\` IN (:keys)
      ORDER BY \`key\`${lockClause}`,
    { replacements: { keys: AFFECTED_KEYS }, transaction }
  );
  return rows;
}

async function readReferenceState(sequelize, transaction) {
  const [allTaxonomy] = await sequelize.query('SELECT id FROM care_needs ORDER BY id', { transaction });
  const validIds = new Set(allTaxonomy.map((row) => Number(row.id)));
  const [recipients] = await sequelize.query(
    'SELECT id, care_needs AS selections FROM care_recipients WHERE care_needs IS NOT NULL ORDER BY id FOR UPDATE',
    { transaction }
  );
  const [caregivers] = await sequelize.query(
    'SELECT id, skills AS selections FROM care_givers WHERE skills IS NOT NULL ORDER BY id FOR UPDATE',
    { transaction }
  );
  return {
    recipients: validateReferences(recipients, validIds, 'care_recipients.care_needs'),
    caregivers: validateReferences(caregivers, validIds, 'care_givers.skills'),
  };
}

async function validateSchema(sequelize, transaction, database) {
  const requiredColumns = {
    care_needs: ROW_COLUMNS,
    care_recipients: ['id', 'care_needs'],
    care_givers: ['id', 'skills'],
    migration_meta: ['id', 'name', 'executed_at'],
  };
  const [columns] = await sequelize.query(
    `SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = :database AND TABLE_NAME IN (:tables)`,
    { replacements: { database, tables: Object.keys(requiredColumns) }, transaction }
  );
  const found = new Map();
  for (const row of columns) {
    if (!found.has(row.table_name)) found.set(row.table_name, new Set());
    found.get(row.table_name).add(row.column_name);
  }
  for (const [table, expectedColumns] of Object.entries(requiredColumns)) {
    for (const column of expectedColumns) {
      if (!found.get(table)?.has(column)) fail(`required schema column is missing: ${table}.${column}`);
    }
  }
  const [tableEngines] = await sequelize.query(
    `SELECT TABLE_NAME AS table_name, ENGINE AS engine
       FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = :database AND TABLE_NAME IN (:tables)`,
    { replacements: { database, tables: WRITABLE_TABLES }, transaction }
  );
  assertTransactionalEngines(tableEngines);
  const [uniqueIndexColumns] = await sequelize.query(
    `SELECT INDEX_NAME AS index_name, SEQ_IN_INDEX AS sequence_number, COLUMN_NAME AS column_name
       FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = :database
        AND TABLE_NAME = 'migration_meta'
        AND NON_UNIQUE = 0
      ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
    { replacements: { database }, transaction }
  );
  const indexes = new Map();
  for (const row of uniqueIndexColumns) {
    if (!indexes.has(row.index_name)) indexes.set(row.index_name, []);
    indexes.get(row.index_name).push(row.column_name);
  }
  const hasExactNameIndex = [...indexes.values()].some(
    (columnsInIndex) => columnsInIndex.length === 1 && columnsInIndex[0] === 'name'
  );
  if (!hasExactNameIndex) fail('migration_meta.name must have a dedicated unique index');
}

async function validateIdentity(sequelize, transaction, options) {
  const [rows] = await sequelize.query(
    'SELECT DATABASE() AS database_name, @@port AS server_port, @@hostname AS server_hostname',
    { transaction }
  );
  if (rows.length !== 1) fail('database identity query returned an unexpected result');
  const identity = rows[0];
  if (identity.database_name !== options.expectedDatabase) fail('connected database name mismatch');
  if (Number(identity.server_port) !== options.expectedPort) fail('connected database port mismatch');
  return identity;
}

async function validateMarkerAbsent(sequelize, transaction) {
  const [rows] = await sequelize.query(
    'SELECT id, name FROM migration_meta WHERE name = :name FOR UPDATE',
    { replacements: { name: MIGRATION_NAME }, transaction }
  );
  if (rows.length !== 0) fail('approved migration marker already exists');
}

async function execute(options, migration, env = process.env) {
  requireExecutionEnvironment(options, env);
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize(options.expectedDatabase, env.DB_USER, env.DB_PASSWORD, {
    host: options.expectedHost,
    port: options.expectedPort,
    dialect: 'mysql',
    logging: false,
  });
  let transaction;
  let snapshot;
  let failure;
  let commitAttempted = false;
  let commitSucceeded = false;
  try {
    transaction = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    });
    const identity = await validateIdentity(sequelize, transaction, options);
    await validateSchema(sequelize, transaction, options.expectedDatabase);
    await validateMarkerAbsent(sequelize, transaction);
    const preRows = await selectTaxonomyRows(sequelize, transaction);
    assertExpectedRows(preRows, PRECONDITIONS, 'precondition');
    const preReferences = await readReferenceState(sequelize, transaction);
    const [unaffectedRows] = await sequelize.query(
      `SELECT ${ROW_SELECT_LIST}
         FROM care_needs WHERE \`key\` NOT IN (:keys) ORDER BY \`key\` FOR UPDATE`,
      { replacements: { keys: AFFECTED_KEYS }, transaction }
    );
    const unaffectedDigest = stableDigest(unaffectedRows.map(normalizeRow));
    snapshot = {
      status: 'prepared',
      createdAt: new Date().toISOString(),
      migration: MIGRATION_NAME,
      checksum: APPROVED_SHA256,
      expectedTarget: {
        host: options.expectedHost,
        port: options.expectedPort,
        database: options.expectedDatabase,
      },
      serverIdentity: identity,
      approvalReference: options.approvalReference,
      backupReference: options.backupReference,
      backupVerifiedAt: options.backupVerifiedAt,
      taxonomyRows: preRows.map(normalizeRow),
      references: preReferences,
      unaffectedTaxonomyDigest: unaffectedDigest,
    };
    writeExclusiveJson(options.snapshotOutput, snapshot);

    const calls = [];
    const queryInterface = sequelize.getQueryInterface();
    const restrictedQueryInterface = {
      bulkUpdate: async (table, values, where, suppliedOptions = {}) => {
        if (table !== 'care_needs') fail(`migration attempted to update forbidden table: ${table}`);
        if (suppliedOptions.transaction && suppliedOptions.transaction !== transaction) {
          fail('migration attempted to replace the enforced transaction');
        }
        if (calls.length >= 4) fail('migration attempted more than four updates');
        const result = await queryInterface.bulkUpdate(
          table,
          values,
          where,
          { ...suppliedOptions, transaction }
        );
        calls.push({ table, affected: result });
        return result;
      },
    };
    await migration.up(restrictedQueryInterface, Sequelize);
    if (calls.length !== 4) fail(`migration performed ${calls.length} updates instead of four`);

    const postRows = await selectTaxonomyRows(sequelize, transaction, false);
    assertPostRows(preRows, postRows);
    const postReferences = await readReferenceState(sequelize, transaction);
    assertSameDigest(preReferences.recipients, postReferences.recipients, 'recipient references');
    assertSameDigest(preReferences.caregivers, postReferences.caregivers, 'caregiver references');
    const [postUnaffectedRows] = await sequelize.query(
      `SELECT ${ROW_SELECT_LIST}
         FROM care_needs WHERE \`key\` NOT IN (:keys) ORDER BY \`key\``,
      { replacements: { keys: AFFECTED_KEYS }, transaction }
    );
    if (stableDigest(postUnaffectedRows.map(normalizeRow)) !== unaffectedDigest) {
      fail('an unaffected taxonomy row changed');
    }
    await sequelize.query(
      'INSERT INTO migration_meta (name) VALUES (:name)',
      { replacements: { name: MIGRATION_NAME }, transaction }
    );
    const [markers] = await sequelize.query(
      'SELECT name FROM migration_meta WHERE name = :name',
      { replacements: { name: MIGRATION_NAME }, transaction }
    );
    if (markers.length !== 1 || markers[0].name !== MIGRATION_NAME) {
      fail('migration marker postcondition failed');
    }
    commitAttempted = true;
    try {
      await transaction.commit();
      commitSucceeded = true;
      transaction = undefined;
    } catch (commitError) {
      transaction = undefined;
      throw new UnknownCommitStateError(commitError);
    }
    const receiptPath = `${options.snapshotOutput}.committed.json`;
    try {
      writeExclusiveJson(receiptPath, {
        ...snapshot,
        status: 'committed',
        committedAt: new Date().toISOString(),
        updateCalls: calls.length,
      });
    } catch (receiptError) {
      throw new PostCommitRecoveryError(`receipt generation for ${receiptPath}`, receiptError);
    }
  } catch (error) {
    failure = commitSucceeded && !(error instanceof PostCommitRecoveryError)
      ? new PostCommitRecoveryError('post-commit processing', error)
      : error;
    if (transaction && !commitAttempted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        failure.rollbackError = rollbackError;
      }
    }
  } finally {
    try {
      await sequelize.close();
    } catch (closeError) {
      if (commitSucceeded) {
        if (!(failure instanceof PostCommitRecoveryError)) {
          failure = new PostCommitRecoveryError('connection cleanup', closeError);
        } else {
          failure.addIssue('connection cleanup', closeError);
        }
      } else if (failure instanceof UnknownCommitStateError) {
        failure.cleanupErrors.push(closeError);
      } else if (failure) {
        failure.closeError = closeError;
      } else {
        failure = closeError;
      }
    }
  }
  if (failure) throw failure;
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function formatCliFailure(error) {
  if (error instanceof PostCommitRecoveryError) {
    const issueLines = error.issues.map(
      ({ kind, cause }) => `- ${kind} failed: ${errorMessage(cause)}`
    );
    return [
      'SUCCESS WITH RECOVERY ACTION REQUIRED: The database transaction COMMITTED successfully.',
      ...issueLines,
      'Do NOT rerun the migration. Verify migration_meta and recover the receipt evidence separately.',
    ].join('\n');
  }
  if (error instanceof UnknownCommitStateError) {
    const cleanupLines = error.cleanupErrors.map(
      (cleanupError) => `- Additional cleanup failure: ${errorMessage(cleanupError)}`
    );
    return [
      'UNKNOWN COMMIT STATE: The client did not receive a reliable COMMIT result.',
      `Original COMMIT error: ${errorMessage(error.cause)}`,
      ...cleanupLines,
      'DO NOT rerun the migration.',
      'Verify migration_meta independently and determine the actual commit state before taking any action.',
    ].join('\n');
  }
  const details = [`FAILURE BEFORE COMMIT: ${errorMessage(error)}`];
  if (error.rollbackError) details.push(`Rollback also failed: ${errorMessage(error.rollbackError)}`);
  if (error.closeError) details.push(`Connection cleanup also failed: ${errorMessage(error.closeError)}`);
  return details.join('\n');
}

function exitCodeForFailure(error) {
  return Number.isInteger(error.exitCode) ? error.exitCode : 1;
}

function plan(options) {
  return {
    mode: 'plan',
    databaseConnectionAttempted: false,
    migration: MIGRATION_NAME,
    migrationPath: APPROVED_MIGRATION_PATH,
    checksum: APPROVED_SHA256,
    expectedTarget: {
      host: options.expectedHost,
      port: options.expectedPort,
      database: options.expectedDatabase,
    },
    affectedKeys: AFFECTED_KEYS,
    safeguards: [
      'exact migration path and checksum are pinned before module loading',
      'execution requires approval, recent backup, evidence path, typed confirmation, and environment interlock',
      'target configuration and connected database identity must match explicit expectations',
      'schema, marker absence, exact preconditions, references, and unaffected rows are validated',
      'four restricted updates and the exact marker share one serializable transaction',
      'postconditions, stable IDs, references, and unaffected rows are validated before commit',
      'the migration down method is never invoked',
    ],
  };
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const options = parseArgs(argv);
  const migration = loadApprovedMigration();
  if (options.mode === 'plan') {
    process.stdout.write(`${JSON.stringify(plan(options), null, 2)}\n`);
    return;
  }
  await execute(options, migration, env);
  process.stdout.write('SUCCESS: Isolated taxonomy migration committed and verified.\n');
}

module.exports = {
  AFFECTED_KEYS,
  APPROVED_MIGRATION_PATH,
  APPROVED_SHA256,
  EXECUTION_CONFIRMATION,
  EXECUTION_INTERLOCK,
  MIGRATION_NAME,
  POSTCONDITIONS,
  PRECONDITIONS,
  POST_COMMIT_RECOVERY_EXIT_CODE,
  UNKNOWN_COMMIT_STATE_EXIT_CODE,
  PostCommitRecoveryError,
  UnknownCommitStateError,
  assertTransactionalEngines,
  assertExpectedRows,
  assertPostRows,
  checksumApprovedMigration,
  compileVerifiedCommonJs,
  exitCodeForFailure,
  formatCliFailure,
  loadApprovedMigration,
  parseArgs,
  plan,
  requireExecutionEnvironment,
  validateReferences,
};

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${formatCliFailure(error)}\n`);
    process.exitCode = exitCodeForFailure(error);
  });
}
