import User from './User.js';
import Event from './Event.js';
import Registration from './Registrations.js';
import EmailBlast from './EmailBlast.js';
import EmailTemplate from './EmailTemplate.js';

// Define associations
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });
User.hasMany(EmailBlast, { foreignKey: 'userId', as: 'emailBlasts' });

Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations' });
Event.hasMany(EmailBlast, { foreignKey: 'eventId', as: 'emailBlasts' });

Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

EmailBlast.belongsTo(User, { foreignKey: 'userId', as: 'user' });
EmailBlast.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

export {
  User,
  Event,
  Registration,
  EmailBlast,
  EmailTemplate,
};