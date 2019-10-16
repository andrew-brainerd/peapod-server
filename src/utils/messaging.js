const { RestClient } = require('@signalwire/node');

const client = new RestClient(
  process.env.SIGNALWIRE_PROJECT_ID,
  process.env.SIGNALWIRE_API_KEY
);

client.messages
  .create({
    from: process.env.SIGNALWIRE_PHONE_NUMBER,
    body: 'Hello World!',
    to: '+19897210902'
  })
  .then(message => console.log(message))
  .done();
