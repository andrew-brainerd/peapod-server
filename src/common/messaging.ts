import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import * as log from './logger.js';

export const messageTypes = {
  SMS: 'sms',
  EMAIL: 'email'
} as const;

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendSms = async (body: string, to: string) => {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_FROM_PHONE_NUMBER!,
      to: `+1${to}`,
      body: body || 'Empty Message'
    });
    log.info(`Sending message to ${message.to}: [${message.body}]`);
  } catch (err) {
    console.error('Failed to send SMS message', err);
  }
};

export const sendEmail = async (subject: string, body: string, to: string) => {
  try {
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      to,
      subject,
      html: body
    });
    log.info(`Sending email to ${to}: [${subject}]`);
  } catch (err) {
    console.error('Failed to send email', err);
  }
};
