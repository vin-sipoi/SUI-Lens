import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Event',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  },
}, {
  tableName: 'registrations',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Registration;
