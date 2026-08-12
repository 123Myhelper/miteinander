const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const CareRecipient = sequelize.define('CareRecipient', require('./careRecipientFields')(DataTypes), {
    tableName: 'care_recipients',
    timestamps: true,
    underscored: true,
    paranoid: true,
    hooks: {
      beforeCreate: async (careRecipient) => {
        if (careRecipient.password) {
          careRecipient.password = await bcrypt.hash(careRecipient.password, 10);
        }
      },
      beforeUpdate: async (careRecipient) => {
        if (careRecipient.changed('password')) {
          careRecipient.password = await bcrypt.hash(careRecipient.password, 10);
        }
      },
    },
  });

  // Instance methods
  CareRecipient.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  CareRecipient.prototype.toJSON = function() {
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
  CareRecipient.associate = (models) => {
    CareRecipient.belongsTo(models.CareGiver, {
      foreignKey: 'settledWithCaregiverId',
      as: 'settledWithCaregiver',
    });
  };

  return CareRecipient;
};
