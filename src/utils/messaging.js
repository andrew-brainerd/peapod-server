const { RestClient } = require('@signalwire/node');

const client = new RestClient(
  process.env.SIGNALWIRE_PROJECT_ID,
  process.env.SIGNALWIRE_API_KEY
);

const sendSms = body => {
  client.messages
    .create({
      from: process.env.SIGNALWIRE_FROM_PHONE_NUMBER,
      to: process.env.SIGNALWIRE_TO_PHONE_NUMBER,
      body: body || 'Empty Message'
    })
    .then(message => {
      console.log(`Sending message to ${message.to}: [${message.body}]`);
    })
    .done();
};

module.exports = {
  sendSms
}
