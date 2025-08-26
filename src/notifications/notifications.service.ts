import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// Extend Nodemailer SentMessageInfo to include previewURL (used by ethereal.email)
interface ExtendedSentMessageInfo extends SMTPTransport.SentMessageInfo {
  previewURL?: string;
}

@Injectable()
export class NotificationsService {
  private transporter: Transporter<ExtendedSentMessageInfo>;
  private readonly logger = new Logger(NotificationsService.name);
  private readonly from: string;

  constructor(private readonly cfg: ConfigService) {
    const smtpUser = this.cfg.get<string>('SMTP_USER') ?? '';
    const smtpPass = this.cfg.get<string>('SMTP_PASS') ?? '';
    const smtpHost = this.cfg.get<string>('SMTP_HOST') ?? 'localhost';
    const smtpPort = Number(this.cfg.get<string>('SMTP_PORT') ?? '587');
    const secure =
      (this.cfg.get<string>('SMTP_SECURE') ?? '').toLowerCase() === 'true' ||
      smtpPort === 465;

    const transportConfig: SMTPTransport.Options = {
      host: smtpHost,
      port: smtpPort,
      secure,
      auth:
        smtpUser && smtpPass
          ? {
              user: smtpUser,
              pass: smtpPass,
            }
          : undefined,
    };

    this.transporter =
      createTransport<ExtendedSentMessageInfo>(transportConfig);
    this.from = this.cfg.get<string>('MAIL_FROM') ?? 'no-reply@example.com';

    this.logger.log(
      `SMTP transporter configured for host ${transportConfig.host}:${transportConfig.port}`,
    );
  }

  async sendMatchCreated(
    to: string,
    payload: {
      projectId: string;
      country: string;
      vendorName: string;
      score: number;
    },
  ): Promise<void> {
    const subject = `New vendor match for Project ${payload.projectId}: ${payload.vendorName}`;
    const text = `A new match was created for project ${payload.projectId} (${payload.country}): ${payload.vendorName} (score ${payload.score}).`;

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
      });

      this.logger.log(
        `Email sent successfully to ${to}: ${info.messageId ?? 'No message ID'}`,
      );

      if (info.envelope) {
        this.logger.debug(
          `Envelope: ${JSON.stringify(info.envelope)} | Preview URL: ${
            info.previewURL ?? 'N/A'
          }`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`Email send failed to ${to}: ${errorMessage}`);
    }
  }
}
