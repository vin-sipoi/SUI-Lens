const User = require('./User.js');
const Event = require('./Event.js');
const Registration = require('./Registrations.js');
const EmailBlast = require('./EmailBlast.js');
const EmailTemplate = require('./EmailTemplate.js');
const Community = require('./Community.js');

// Define associations
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });
User.hasMany(EmailBlast, { foreignKey: 'userId', as: 'emailBlasts' });
User.hasMany(Event, { foreignKey: 'userId', as: 'events' });

Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations' });
Event.hasMany(EmailBlast, { foreignKey: 'eventId', as: 'emailBlasts' });
Event.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Event.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });

Community.hasMany(Event, { foreignKey: 'communityId', as: 'events' });

Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

EmailBlast.belongsTo(User, { foreignKey: 'userId', as: 'user' });
EmailBlast.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = {
  User,
  Event,
  Registration,
  EmailBlast,
  EmailTemplate,
  Community,
};
