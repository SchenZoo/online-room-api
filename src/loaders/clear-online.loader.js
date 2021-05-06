const { EventService } = require('../services/app');

async function load() {
  await EventService.restartAllParticipantsOnlineStatus();
}

module.exports = load;
