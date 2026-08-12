// Barrel: auth handlers split into auth*.js to keep files < 200 lines.
// Public interface (exported handler names) is unchanged.
module.exports = {
  ...require('./authRegister'),
  ...require('./authVerify'),
  ...require('./authSession'),
  ...require('./authPassword'),
};
