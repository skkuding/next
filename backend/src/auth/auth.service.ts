import { CACHE_MANAGER, forwardRef, Inject, Injectable } from '@nestjs/common'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { UserService } from 'src/user/user.service'
import { Cache } from 'cache-manager'

import { refreshTokenCacheKey } from '../common/cache/keys'
import {
  InvalidUserException,
  InvalidJwtTokenException
} from '../common/exception/business.exception'
import { validate } from '../common/hash'

import {
  ACCESS_TOKEN_EXPIRATION_SEC,
  REFRESH_TOKEN_EXPIRATION_SEC
} from './constants/jwt.constants'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtObject, JwtPayload, JwtTokens } from './interface/jwt.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async issueJwtTokens(loginUserDto: LoginUserDto): Promise<JwtTokens> {
    const user = await this.userService.getUserCredential(loginUserDto.username)
    if (!(await this.isValidUser(user, loginUserDto.password))) {
      throw new InvalidUserException('Incorrect username or password')
    }
    return await this.createJwtTokens(user.id, user.username)
  }

  async isValidUser(user: User, password: string) {
    if (!user || !(await validate(user.password, password))) {
      return false
    }
    return true
  }

  async updateJwtTokens(refreshToken: string): Promise<JwtTokens> {
    const { userId, username } = await this.verifyJwtToken(refreshToken)
    if (!(await this.isValidRefreshToken(refreshToken, userId))) {
      throw new InvalidJwtTokenException('Unidentified refresh token')
    }
    return await this.createJwtTokens(userId, username)
  }

  async verifyJwtToken(
    token: string,
    options: JwtVerifyOptions = {}
  ): Promise<JwtObject> {
    const jwtVerifyOptions = {
      secret: this.config.get('JWT_SECRET'),
      ...options
    }
    try {
      return await this.jwtService.verifyAsync(token, jwtVerifyOptions)
    } catch (error) {
      throw new InvalidJwtTokenException(error.message)
    }
  }

  async isValidRefreshToken(refreshToken: string, userId: number) {
    const cachedRefreshToken = await this.cacheManager.get(
      refreshTokenCacheKey(userId)
    )
    if (cachedRefreshToken !== refreshToken) {
      return false
    }
    return true
  }

  async createJwtTokens(userId: number, username: string): Promise<JwtTokens> {
    const payload: JwtPayload = { userId, username }
    const accessToken = await this.jwtService.signAsync({
      ...payload,
      expiresIn: ACCESS_TOKEN_EXPIRATION_SEC
    })
    const refreshToken = await this.jwtService.signAsync({
      ...payload,
      expiresIn: REFRESH_TOKEN_EXPIRATION_SEC
    })

    await this.cacheManager.set(refreshTokenCacheKey(userId), refreshToken, {
      ttl: REFRESH_TOKEN_EXPIRATION_SEC
    })

    return { accessToken, refreshToken }
  }

  async deleteRefreshToken(userId: number) {
    return await this.cacheManager.del(refreshTokenCacheKey(userId))
  }
}
