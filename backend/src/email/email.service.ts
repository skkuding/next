import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetLink(
    email: string,
    userId: number,
    token: string
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `Reset your password`,
      html: `<div>If you want to reset your password, Click the link.</div>
      <div>http://localhost:5000/user/${userId}/password/reset/${token}</div>`
    })
  }
}
