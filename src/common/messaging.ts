import twilio from 'twilio';
import * as log from './logger.js';

export const messageTypes = {
  SMS: 'sms'
} as const;

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export const sendSms = async (body: string, to: string) => {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_FROM_PHONE_NUMBER!,
      to: `+1${to}`,
      body: body || 'Empty Message'
    });
    log.info(`Sending message to ${message.to}: [${message.body}]`);
  } catch (err) {
    console.error('Failed to send SMS message', err);
  }
};
