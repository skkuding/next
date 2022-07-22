import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { randomBytes } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import { encrypt } from 'src/common/hash'
import { passwordResetTokenCacheKey } from 'src/common/cache/keys'
import { UserEmailDto } from './userEmail.dto'
import { NewPwDto } from './newPw.dto'
import { User } from '@prisma/client'
import {
  InvalidTokenException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
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

  async getUserCredentialByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { email }
    })
  }

  async createTokenAndSendEmail({ email }: UserEmailDto): Promise<string> {
    const user = await this.getUserCredentialByEmail(email)

    if (!user) {
      throw new InvalidUserException(
        `Cannot find a registered user whose email address is ${email}`
      )
    }

    const token = this.createBase64UrlEncodedTokenRandomly(24)

    const sentEmailInfo = await this.emailService.sendPasswordResetLink(
      email,
      user.id,
      token
    )

    await this.createTokenInCache(
      passwordResetTokenCacheKey(user.id),
      token,
      300
    )

    return 'Password reset link was sent to your email'
  }

  createBase64UrlEncodedTokenRandomly(bytes: number): string {
    return randomBytes(bytes).toString('base64url')
  }

  async createTokenInCache(
    key: string,
    token: string,
    timeToLive: number
  ): Promise<void> {
    await this.cacheManager.set(key, token, { ttl: timeToLive })
  }

  async updatePassword(
    userId: number,
    resetToken: string,
    { newPassword }: NewPwDto
  ): Promise<string> {
    const storedResetToken: string = await this.getTokenFromCache(
      passwordResetTokenCacheKey(userId)
    )

    if (!storedResetToken || resetToken !== storedResetToken) {
      throw new InvalidTokenException('Token not found or invalid token')
    }

    const updatedUser = await this.updateUserPasswordInPrisma(
      userId,
      newPassword
    )

    await this.deleteTokenFromCache(passwordResetTokenCacheKey(userId))

    return 'Password Reset successfully'
  }

  async getTokenFromCache(key: string): Promise<string> {
    const storedToken: string = await this.cacheManager.get(key)
    return storedToken
  }

  async deleteTokenFromCache(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async updateUserPasswordInPrisma(
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
