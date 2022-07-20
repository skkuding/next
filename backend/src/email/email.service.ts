import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { SentMessageInfo } from 'nodemailer'
import { EmailTransmissionFailedException } from 'src/common/exception/business.exception'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetLink(
    email: string,
    userId: number,
    token: string
  ): Promise<SentMessageInfo> {
    const sentEmailInfo = await this.mailerService.sendMail({
      to: email,
      subject: `Reset your password`,
      html: `<div>If you want to reset your password, Click the link.</div>
      <div>http://localhost:5000/user/${userId}/password/reset/${token}</div>`
    })

    if (sentEmailInfo.accepted.length === 0) {
      throw new EmailTransmissionFailedException('Email transmission failed')
    }

    return sentEmailInfo
  }
}
