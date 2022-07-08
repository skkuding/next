import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomBytes } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config'
import { encrypt } from 'src/auth/common/hash'
import { InvalidSMTPException } from './invalidSMTP.exception'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

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
        to: email,
        subject: 'Using Nodemailer',
        html: html
      })

      return sentMessageInfo
    } catch (error) {
      throw new InvalidSMTPException(error)
    }
  }

  private async getTokenFromCache(key: string): Promise<string> {
    try {
      const storedToken: string = await this.cacheManager.get(key)
      return storedToken
    } catch (error) {
      throw new InternalServerErrorException(
        'Cache problem; Cannot get the token'
      )
    }
  }

  private async setTokenInCache(
    key: string,
    token: string,
    timeToLive: number
  ): Promise<void> {
    try {
      await this.cacheManager.set(key, token, { ttl: timeToLive })
    } catch (error) {
      throw new InternalServerErrorException(
        'Cache Problem; Cannot save the token'
      )
    }
  }

  private async deleteTokenFromCache(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key)
    } catch (error) {
      throw new InternalServerErrorException(
        'Cache Problem; Cannot delete the token'
      )
    }
  }

  async sendPwResetToken(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (user === null) {
      throw new NotFoundException(
        `Cannot find a registered user whose email address is ${email}`
      )
    }

    const token: string = randomBytes(24).toString('base64url')

    await this.sendEmail(
      email,
      `<div>If you want to reset your password, Click the link.</div>
    <div>http://localhost:5000/user/${user.id}/password/reset/${token}</div>`
    )

    await this.setTokenInCache(`pw-reset:${user.id}`, token, 300)

    return 'Password reset link was sent to your email'
  }

  async updatePassword(
    userId: number,
    resetToken: string,
    newPassword: string
  ): Promise<string> {
    const storedResetToken: string = await this.getTokenFromCache(
      `pw-reset:${userId}`
    )

    if (storedResetToken === null) {
      throw new NotFoundException('Token Not Found')
    }

    if (resetToken !== storedResetToken) {
      throw new NotFoundException('Invalid Token')
    }

    try {
      await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          password: await encrypt(newPassword)
        }
      })
    } catch (error) {
      throw new InternalServerErrorException(
        'DB error caused while updating new password'
      )
    }

    await this.deleteTokenFromCache(`pw-reset:${userId}`)

    return 'Password Reset successfully'
  }
}
