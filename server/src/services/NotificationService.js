/**
 * Abstract base class for notification providers.
 * Implement `send()` in any subclass to add a new notification channel.
 */
class NotificationService {
  /**
   * Send a notification.
   * @param {Object} options
   * @param {string} options.to - Recipient identifier (email, phone, etc.)
   * @param {string} options.subject - Notification subject / title
   * @param {string} options.body - Notification body (HTML or plain text)
   */
  async send({ to, subject, body }) {
    throw new Error(
      `NotificationService.send() is not implemented in ${this.constructor.name}`
    );
  }
}

export default NotificationService;
