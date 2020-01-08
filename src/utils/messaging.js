const { RestClient } = require('@signalwire/node');
const log = require('./log');

const messageTypes = {
  SMS: 'sms'
};

const client = new RestClient(
  process.env.SIGNALWIRE_PROJECT_ID,
  process.env.SIGNALWIRE_API_KEY
);

const sendSms = (body, to) => {
  client.messages
    .create({
      from: process.env.SIGNALWIRE_FROM_PHONE_NUMBER,
      to: `+1${to}` || process.env.SIGNALWIRE_TO_PHONE_NUMBER,
      body: body || 'Empty Message'
    })
    .then(message => {
      log.info(`Sending message to ${message.to}: [${message.body}]`);
    })
    .catch(err => console.error('Failed to send SMS message', err))
    .done();
};

module.exports = {
  messageTypes,
  sendSms
};
