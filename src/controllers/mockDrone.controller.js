const EventEmitter = require('events');

class MockDrone extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  async connect() {
    console.log('Simulating connection to drone...');
    setTimeout(() => this.emit('connection'), 1000);
  }

  async send(command, value = null) {
    const commandString = value !== null ? `${command} ${value}` : command;
    console.log(`Simulating sending command: ${commandString}`);
    this.emit('send', null, commandString.length);

    let delay;
    switch (command) {
      case 'takeoff':
      case 'land':
        delay = 10000;
        break;
      case 'up':
      case 'down':
      case 'left':
      case 'right':
      case 'forward':
      case 'back':
        delay = value * 100;
        break;
      default:
        delay = 500;
    }

    setTimeout(() => this.emit('message', `${commandString} successful`), delay);
  }

  async disconnect() {
    console.log('Simulating disconnection from drone...');
    setTimeout(() => this.emit('disconnection'), 1000);
  }
}

module.exports = MockDrone;