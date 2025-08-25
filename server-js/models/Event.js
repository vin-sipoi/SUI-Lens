import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  bannerUrl: {
    type: DataTypes.TEXT,
    field: 'banner_url',
    allowNull: true,
  },
  nftImageUrl: {
    type: DataTypes.TEXT,
    field: 'nft_image_url',
    allowNull: true,
  },
  poapImageUrl: {
    type: DataTypes.TEXT,
    field: 'poap_image_url',
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    field: 'start_date',
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    field: 'end_date',
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 1,
    },
  },
  ticketPrice: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'ticket_price',
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    field: 'is_free',
    allowNull: false,
    defaultValue: true,
  },
  requiresApproval: {
    type: DataTypes.BOOLEAN,
    field: 'requires_approval',
    allowNull: false,
    defaultValue: false,
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    field: 'is_private',
    allowNull: false,
    defaultValue: false,
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  qrCode: {
    type: DataTypes.TEXT,
    field: 'qr_code',
    allowNull: true,
  },
  eventUrl: {
    type: DataTypes.TEXT,
    field: 'event_url',
    allowNull: true,
  },
  poapEnabled: {
    type: DataTypes.BOOLEAN,
    field: 'poap_enabled',
    allowNull: false,
    defaultValue: false,
  },
  poapName: {
    type: DataTypes.STRING(255),
    field: 'poap_name',
    allowNull: true,
  },
  poapDescription: {
    type: DataTypes.TEXT,
    field: 'poap_description',
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.STRING(255),
    field: 'created_by',
    allowNull: true,
  },
  suiEventId: {
    type: DataTypes.STRING(255),
    field: 'sui_event_id',
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'Event',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Event;
