const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const CareGiver = sequelize.define('CareGiver', require('./careGiverFields')(DataTypes), {
    tableName: 'care_givers',
    timestamps: true,
    underscored: true,
    paranoid: true,
    hooks: {
      beforeCreate: async (careGiver) => {
        if (careGiver.password) {
          careGiver.password = await bcrypt.hash(careGiver.password, 10);
        }
      },
      beforeUpdate: async (careGiver) => {
        if (careGiver.changed('password')) {
          careGiver.password = await bcrypt.hash(careGiver.password, 10);
        }
      },
    },
  });

  // Instance methods
  CareGiver.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  CareGiver.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.verificationCode;
    delete values.verificationCodeExpiresAt;
    delete values.resetPasswordCode;
    delete values.resetPasswordCodeExpiresAt;
    delete values.stripeCustomerId;
    delete values.deletedAt;
    return values;
  };

  // Associations
  CareGiver.associate = (models) => {
    // Add associations here when needed
    // Example: CareGiver.hasMany(models.Booking, { foreignKey: 'care_giver_id' });
  };

  return CareGiver;
};
