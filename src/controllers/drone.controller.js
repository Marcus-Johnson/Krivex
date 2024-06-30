const MockDrone = require('../controllers/mockDrone.controller');
const config = require('../config/default');
const missions = require('../missions/missions.json');
const winston = require('winston');
const logger = require('../logger')

const drones = [];

for (let i = 0; i < missions.length; i++) {
  const drone = new MockDrone(config.drone);
  drones.push(drone);
}

const executeMissions = async () => {
  for (let i = 0; i < drones.length; i++) {
    const drone = drones[i];
    const mission = missions[i];

    drone.on('connection', () => {
      logger.info(`Drone ${i + 1} connected for mission: ${mission.name}`);
      mission.pattern.reduce((promise, step) => {
        return promise.then(() => drone.send(step.command, step.value)
          .then(() => logger.info(`Drone ${i + 1} executed command: ${step.command} ${step.value || ''}`))
          .catch(err => {
            logger.error(`Drone ${i + 1} encountered error on command: ${step.command} ${step.value || ''}`, err);
            return drone.send('land').then(() => logger.info(`Drone ${i + 1} landed due to error`));
          }));
      }, Promise.resolve());
    });

    drone.on('state', (state) => {
      logger.info(`Drone ${i + 1} state: ${JSON.stringify(state)}`);
    });

    drone.on('send', (err, length) => {
      if (err) logger.error(`Drone ${i + 1} send error:`, err);
      logger.info(`Drone ${i + 1} sent command of length: ${length}`);
    });

    drone.on('message', (message) => {
      logger.info(`Drone ${i + 1} message: ${message}`);
    });

    drone.connect()
      .catch(err => {
        logger.error(`Drone ${i + 1} failed to connect:`, err);
      });
  }
};

module.exports = { executeMissions };
