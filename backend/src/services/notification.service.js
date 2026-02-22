/**
 * @fileoverview Notification service - sends alert notifications.
 * Supports structured logging and optional AWS SES email delivery.
 */

const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');
const logger = require('../config/logger.config');

class NotificationService {
  constructor() {
    this.sesRegion = process.env.AWS_REGION || process.env.SES_REGION || 'us-east-1';
    this.sesFromEmail = process.env.SES_FROM_EMAIL || '';
    this.sesConfigurationSet = process.env.SES_CONFIGURATION_SET || '';
    this.defaultRecipient = process.env.ALERT_RECIPIENT || '';

    this.sesClient = this.sesFromEmail
      ? new SESv2Client({ region: this.sesRegion })
      : null;
  }

  async send(alert, analysisResult) {
    const payload = this._buildPayload(alert, analysisResult);

    this._logNotification(payload);
    return this._sendEmail(payload);
  }

  _formatMoney(value, currency = 'INR') {
    if (typeof value !== 'number') return 'N/A';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currency} ${value.toFixed(2)}`;
    }
  }

  _resolveRecipient(alert) {
    return alert.notifyEmail || alert.userId?.email || this.defaultRecipient || '';
  }

  _buildPayload(alert, result) {
    const currency = alert.currency || 'INR';
    const currentPriceLabel = this._formatMoney(result.currentPrice, currency);
    const targetPriceLabel = this._formatMoney(alert.targetPrice, currency);
    const fairPriceLabel = this._formatMoney(result.fairPrice, currency);

    const conditionMet = alert.condition === 'below'
      ? `dropped to ${currentPriceLabel} (target: ${targetPriceLabel})`
      : alert.condition === 'above'
        ? `rose to ${currentPriceLabel} (target: ${targetPriceLabel})`
        : `reached ${currentPriceLabel} (target: ${targetPriceLabel})`;

    return {
      alertId: alert._id,
      title: alert.title,
      type: alert.type,
      condition: alert.condition,
      targetPrice: alert.targetPrice,
      currentPrice: result.currentPrice,
      fairPrice: result.fairPrice,
      pricePosition: result.pricePosition,
      currency,
      toEmail: this._resolveRecipient(alert),
      subject: `Price alert triggered: ${alert.title}`,
      textBody: [
        `Your alert "${alert.title}" was triggered.`,
        '',
        `Price ${conditionMet}.`,
        `Fair price estimate: ${fairPriceLabel}`,
        `Position: ${result.pricePosition}`,
        `Recommendation: ${result.buyRecommendation}`,
      ].join('\n'),
      htmlBody: `
        <h2>Price alert triggered</h2>
        <p>Your alert <strong>${alert.title}</strong> was triggered.</p>
        <p>Price ${conditionMet}.</p>
        <ul>
          <li><strong>Fair price:</strong> ${fairPriceLabel}</li>
          <li><strong>Position:</strong> ${result.pricePosition}</li>
          <li><strong>Recommendation:</strong> ${result.buyRecommendation}</li>
        </ul>
      `,
      triggeredAt: new Date(),
    };
  }

  _logNotification(payload) {
    logger.info('Alert notification queued', {
      alertId: payload.alertId,
      title: payload.title,
      currentPrice: payload.currentPrice,
      targetPrice: payload.targetPrice,
      condition: payload.condition,
      toEmail: payload.toEmail || null,
    });
  }

  async _sendEmail(payload) {
    if (!payload.toEmail) {
      logger.warn('Skipping alert email - no recipient available', {
        alertId: payload.alertId,
      });
      return { delivered: false, reason: 'missing-recipient' };
    }

    if (!this.sesClient || !this.sesFromEmail) {
      logger.warn('Skipping alert email - SES is not configured', {
        alertId: payload.alertId,
      });
      return { delivered: false, reason: 'ses-not-configured' };
    }

    try {
      const command = new SendEmailCommand({
        FromEmailAddress: this.sesFromEmail,
        Destination: {
          ToAddresses: [payload.toEmail],
        },
        Content: {
          Simple: {
            Subject: {
              Data: payload.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Text: {
                Data: payload.textBody,
                Charset: 'UTF-8',
              },
              Html: {
                Data: payload.htmlBody,
                Charset: 'UTF-8',
              },
            },
          },
        },
        ...(this.sesConfigurationSet ? { ConfigurationSetName: this.sesConfigurationSet } : {}),
      });

      const response = await this.sesClient.send(command);
      logger.info('SES alert email sent', {
        alertId: payload.alertId,
        messageId: response.MessageId,
        toEmail: payload.toEmail,
      });
      return {
        delivered: true,
        provider: 'ses',
        messageId: response.MessageId,
      };
    } catch (error) {
      logger.error('SES alert email failed', {
        alertId: payload.alertId,
        error: error.message,
      });
      return { delivered: false, reason: 'ses-send-failed', error: error.message };
    }
  }
}

module.exports = new NotificationService();
