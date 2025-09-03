const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // This will automatically generate UUID
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  google_oauth_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  master_password_hash: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  master_password_salt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
}, {
  tableName: 'users', 
  schema: 'app_data', 
  underscored: true,
  timestamps: false,
});

// This ensures that created_at and updated_at are updated automatically when an entry is modified
User.beforeUpdate((user, options) => {
  user.updated_at = new Date();
});

User.beforeCreate((user, options) => {
  user.created_at = new Date();  // Explicitly set created_at
});

// Export the model for use in other parts of the application
module.exports = User;
