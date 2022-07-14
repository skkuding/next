import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomBytes } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config'
import { encrypt } from 'src/common/hash'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { pwResetTokenCacheKey } from 'src/common/cache/keys'
import { UserEmailDto } from './userEmail.dto'
import { NewPwDto } from './newPw.dto'
import { User } from '@prisma/client'
import {
  InvalidMailTransporterException,
  InvalidTokenException,
  InvalidUserException
} from 'src/common/exception/business.exception'

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

  async sendEmail(
    email: string,
    html: string
  ): Promise<SMTPTransport.SentMessageInfo> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.config.get('NODEMAILER_USER'),
          pass: this.config.get('NODEMAILER_PASS')
        }
      })

      const sentMessageInfo = await transporter.sendMail({
        from: `SKKU CODING PLATFORM <${this.config.get('NODEMAILER_USER')}>`,
        to: email,
        subject: 'Using Nodemailer',
        html: html
      })

      return sentMessageInfo
    } catch (error) {
      throw new InvalidMailTransporterException(
        'mail auth failed or smtp server failed'
      )
    }
  }

  private async getTokenFromCache(key: string): Promise<string> {
    const storedToken: string = await this.cacheManager.get(key)
    return storedToken
  }

  private async createTokenInCache(
    key: string,
    token: string,
    timeToLive: number
  ): Promise<void> {
    await this.cacheManager.set(key, token, { ttl: timeToLive })
  }

  private async deleteTokenFromCache(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async sendPwResetToken({ email }: UserEmailDto): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (user === null) {
      throw new InvalidUserException(
        `Cannot find a registered user whose email address is ${email}`
      )
    }

    const token: string = randomBytes(24).toString('base64url')

    await this.sendEmail(
      email,
      `<div>If you want to reset your password, Click the link.</div>
    <div>http://localhost:5000/user/${user.id}/password/reset/${token}</div>`
    )

    await this.createTokenInCache(pwResetTokenCacheKey(user.id), token, 300)

    return 'Password reset link was sent to your email'
  }

  async updatePassword(
    userId: number,
    resetToken: string,
    { newPassword }: NewPwDto
  ): Promise<string> {
    const storedResetToken: string = await this.getTokenFromCache(
      pwResetTokenCacheKey(userId)
    )

    if (!storedResetToken || resetToken !== storedResetToken) {
      throw new InvalidTokenException('Token not found or invalid token')
    }

    const updatedUser = await this.updateUserPasswordInPrisma(
      userId,
      newPassword
    )

    await this.deleteTokenFromCache(pwResetTokenCacheKey(userId))

    return 'Password Reset successfully'
  }

  private async updateUserPasswordInPrisma(
    userId: number,
    newPassword: string
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: await encrypt(newPassword)
      }
    })

    return updatedUser
  }
}
