import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createMailerOptions(): MailerOptions | Promise<MailerOptions> {
    return {
      transport: {
        service: 'gmail',
        auth: {
          user: this.config.get('NODEMAILER_USER'),
          pass: this.config.get('NODEMAILER_PASS')
        }
      },
      defaults: {
        from: `"SKKU CODING PLATFORM" <${this.config.get('NODEMAILER_USER')}>`
      }
    }
  }
}
