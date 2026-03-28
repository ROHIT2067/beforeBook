import nodemailer from 'nodemailer';
import NotificationService from './NotificationService.js';
import config from '../config/env.js';
import logger from '../config/logger.js';

class EmailProvider extends NotificationService {
  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async send({ to, subject, body }) {
    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.user}>`,
      to,
      subject,
      html: body,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[EmailProvider] Email sent: ${info.messageId} → ${to}`);
      return info;
    } catch (err) {
      logger.error(`[EmailProvider] Failed to send email: ${err.message}`);
      throw err;
    }
  }
}

export default new EmailProvider();
