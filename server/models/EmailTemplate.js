const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const EmailTemplate = sequelize.define('EmailTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  htmlContent: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  textContent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  variables: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'email_templates',
  timestamps: true,
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
});

module.exports = EmailTemplate;
