import { CACHE_MANAGER } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { Cache } from 'cache-manager'
import { User } from '@prisma/client'

import { AuthService } from './auth.service'
import { UserService } from 'src/user/user.service'
import { PrismaService } from 'src/prisma/prisma.service'

import * as hash from '../common/hash'

import {
  InvalidJwtTokenException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { MailerService } from '@nestjs-modules/mailer'

describe('AuthService', () => {
  let service: AuthService
  let userService: UserService
  let cache: Cache
  let createJwtTokensSpy
  const ACCESS_TOKEN = 'access_token'
  const REFRESH_TOKEN = 'refresh_token'
  const VALID_PASSWORD = 'password'
  const user: User = {
    id: 1,
    username: 'user',
    password: VALID_PASSWORD,
    role: 'User',
    email: '',
    has_email_authenticated: false,
    last_login: undefined,
    create_time: undefined,
    update_time: undefined
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        EmailService,
        { provide: PrismaService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: MailerService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: jest.fn(() => []),
            get: jest.fn(() => [])
          })
        }
      ]
    }).compile()

    userService = module.get<UserService>(UserService)
    service = module.get<AuthService>(AuthService)
    cache = module.get<Cache>(CACHE_MANAGER)
    createJwtTokensSpy = jest
      .spyOn(service, 'createJwtTokens')
      .mockResolvedValue({
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN
      })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('issueJwtTokens', () => {
    let getUserCredentialSpy
    const loginUserDto = { username: 'user', password: VALID_PASSWORD }

    beforeEach(() => {
      getUserCredentialSpy = jest
        .spyOn(userService, 'getUserCredential')
        .mockResolvedValue(user)
    })

    it('should return new access token and refresh token when user validation succeed', async () => {
      //given
      const isValidUserSpy = jest
        .spyOn(service, 'isValidUser')
        .mockResolvedValue(true)

      //when
      const result = await service.issueJwtTokens(loginUserDto)

      //then
      expect(getUserCredentialSpy).toHaveBeenCalledWith(loginUserDto.username)
      expect(isValidUserSpy).toHaveBeenCalledWith(user, loginUserDto.password)
      expect(createJwtTokensSpy).toHaveBeenCalledTimes(1)
      expect(createJwtTokensSpy).toHaveBeenCalledWith(user.id, user.username)
      expect(result).toEqual({
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN
      })
    })

    it('should throw InvalidUserException when the user validation failed', async () => {
      //given
      const isValidUserSpy = jest
        .spyOn(service, 'isValidUser')
        .mockResolvedValue(false)

      //when
      await expect(service.issueJwtTokens(loginUserDto)).rejects.toThrowError(
        InvalidUserException
      )

      //then
      expect(getUserCredentialSpy).toHaveBeenCalledWith(loginUserDto.username)
      expect(isValidUserSpy).toHaveBeenCalledWith(user, loginUserDto.password)
    })
  })

  describe('isValidUser', () => {
    jest
      .spyOn(hash, 'validate')
      .mockImplementation(
        async (passwordFromDB, passwordFromUserInput) =>
          passwordFromDB === passwordFromUserInput
      )

    it("should return true when the given password match with the user's password", async () => {
      //when
      const result = await service.isValidUser(user, VALID_PASSWORD)

      //then
      expect(result).toBe(true)
    })
    it('should return false when the user is given as null', async () => {
      //when
      const result = await service.isValidUser(null, VALID_PASSWORD)

      //then
      expect(result).toBe(false)
    })
    it('should return false when the password validation failed', async () => {
      //when
      const result = await service.isValidUser(user, 'invalid_password')

      //then
      expect(result).toBe(false)
    })
  })

  describe('updateJwtTokens', () => {
    const refreshToken = REFRESH_TOKEN
    const userId = 1
    const username = 'user'
    let verifyJwtTokenSpy

    beforeEach(() => {
      verifyJwtTokenSpy = jest
        .spyOn(service, 'verifyJwtToken')
        .mockResolvedValue({
          userId,
          username,
          iat: undefined,
          exp: undefined,
          iss: undefined
        })
    })

    it('should return new access token and refresh token when the given refresh token is valid', async () => {
      //given
      const isValidRefreshTokenSpy = jest
        .spyOn(service, 'isValidRefreshToken')
        .mockResolvedValue(true)

      //when
      const result = await service.updateJwtTokens(refreshToken)

      //then
      expect(verifyJwtTokenSpy).toHaveBeenCalledWith(refreshToken)
      expect(isValidRefreshTokenSpy).toHaveBeenCalledWith(refreshToken, userId)
      expect(createJwtTokensSpy).toHaveBeenCalledTimes(1)
      expect(createJwtTokensSpy).toHaveBeenCalledWith(userId, username)
      expect(result).toEqual({
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN
      })
    })

    it('should throw InvalidJwtTokenException when the given refresh token is invalid', async () => {
      //given
      const invalidToken = REFRESH_TOKEN
      const isValidRefreshTokenSpy = jest
        .spyOn(service, 'isValidRefreshToken')
        .mockResolvedValue(false)

      //when
      await expect(service.updateJwtTokens(invalidToken)).rejects.toThrowError(
        InvalidJwtTokenException
      )

      //then
      expect(verifyJwtTokenSpy).toHaveBeenCalledWith(invalidToken)
      expect(isValidRefreshTokenSpy).toHaveBeenCalledWith(invalidToken, userId)
    })
  })

  describe('isValidRefreshToken', () => {
    it("should return true when the given refresh token match with the user's cached refresh token", async () => {
      //given
      jest.spyOn(cache, 'get').mockResolvedValue(REFRESH_TOKEN)

      //when
      const result = await service.isValidRefreshToken(REFRESH_TOKEN, user.id)

      //then
      expect(result).toBe(true)
    })
    it("should return true when the given refresh token does not match with the user's cached refresh token", async () => {
      //given
      jest.spyOn(cache, 'get').mockResolvedValue('invalid value')

      //when
      const result = await service.isValidRefreshToken(REFRESH_TOKEN, user.id)

      //then
      expect(result).toBe(false)
    })
    it("should return false when the user's refresh token does not exist in the cache", async () => {
      //given
      jest.spyOn(cache, 'get').mockResolvedValue(null)

      //when
      const result = await service.isValidRefreshToken(REFRESH_TOKEN, user.id)

      //then
      expect(result).toBe(false)
    })
  })
})
