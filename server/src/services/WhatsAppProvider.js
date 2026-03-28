import NotificationService from './NotificationService.js';
import logger from '../config/logger.js';

/**
 * WhatsApp notification provider via Twilio.
 * Currently a stub — activate by:
 *  1. Installing: npm install twilio
 *  2. Filling TWILIO_* env vars in .env
 *  3. Uncommenting the Twilio client code below
 *  4. Swapping the import in scheduler/index.js
 */
class WhatsAppProvider extends NotificationService {
  async send({ to, subject, body }) {
    // ── Activate by uncommenting: ────────────────────────────────────────────
    // import twilio from 'twilio';
    // import config from '../config/env.js';
    // const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    // await client.messages.create({
    //   body: `${subject}\n\n${body}`,
    //   from: config.twilio.from,
    //   to: config.twilio.to,
    // });
    // ────────────────────────────────────────────────────────────────────────

    logger.warn(
      `[WhatsAppProvider] NOT ACTIVE — message not sent to ${to}. ` +
        'Uncomment Twilio code and set TWILIO_* env vars to activate.'
    );
  }
}

export default new WhatsAppProvider();
