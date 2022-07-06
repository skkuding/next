import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomBytes } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config'
import { encrypt } from 'src/auth/common/hash'

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async getUserRole(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      }
    })
  }

  async getUserCredential(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    })
  }
  async sendEmail(email: string, html: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get('NODEMAILER_USER'),
        pass: this.config.get('NODEMAILER_PASS')
      }
    })
    await transporter.sendMail({
      from: this.config.get('NODEMAILER_USER'),
      to: email,
      subject: 'Using Nodemailer',
      html: html
    })
  }

  async sendPwResetEmail(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (user === null) {
      throw 'user not found, please sign up first'
    }

    const token: string = randomBytes(24).toString('base64url')

    await this.sendEmail(
      email,
      `<div>If you want to reset your password, Click the link.</div>
    <div>http://localhost:5000/user/${user.id}/password/reset/${token}</div>`
    )

    await this.cacheManager.set(`pw-reset:${user.id}`, token, { ttl: 300 })

    return 'Password reset link was sent to your email'
  }

  async updatePassword(
    userId: number,
    resetToken: string,
    newPassword: string
  ): Promise<string> {
    const storedResetToken: string = await this.cacheManager.get(
      `pw-reset:${userId}`
    )

    if (storedResetToken === null) {
      throw 'token not found'
    }

    if (resetToken !== storedResetToken) {
      throw 'invalid token'
    }

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: await encrypt(newPassword)
      }
    })

    await this.cacheManager.del(`pw-reset:${userId}`)

    return 'Password Reset successfully'
  }
}
