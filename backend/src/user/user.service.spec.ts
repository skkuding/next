import { MailerService } from '@nestjs-modules/mailer'
import { CACHE_MANAGER } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { Cache } from 'cache-manager'
import { passwordResetTokenCacheKey } from 'src/common/cache/keys'
import {
  InvalidTokenException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from './user.service'

describe('UserService', () => {
  let userService: UserService
  let cache: Cache
  let emailService: EmailService
  let mailer: MailerService

  const USER_ID = 1
  const EMAIL_ADDRESS = 'email@email.com'
  const PASSWORD_RESET_TOKEN_KEY = passwordResetTokenCacheKey(USER_ID)
  const PASSWORD_RESET_TOKEN = 'thisIsPwResetToken'
  const TIME_TO_LIVE = 300
  const NEW_PASSWORD = 'thisISNewPassword'

  const mailerMock = {
    sendMail: jest.fn()
  }
  const cacheMock = {
    get: jest.fn().mockReturnValueOnce(PASSWORD_RESET_TOKEN),
    set: jest.fn(),
    del: jest.fn()
  }
  const user: User = {
    id: USER_ID,
    username: 'user',
    password: 'password',
    role: 'User',
    email: EMAIL_ADDRESS,
    has_email_authenticated: false,
    last_login: undefined,
    create_time: undefined,
    update_time: undefined
  }
  const expectedEmailInfo = {
    accepted: [EMAIL_ADDRESS],
    rejected: [],
    envelopeTime: 715,
    messageTime: 590,
    messageSize: 473,
    response:
      '250 2.0.0 OK  1658043820 q93-56600b001f061359022sm8791552pjk.54 - gsmtp',
    envelope: { from: 'sender_email', to: [EMAIL_ADDRESS] },
    messageId: '6bd7-3d62-c84b-61865f06534b@gmail.com'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        EmailService,
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: MailerService, useValue: mailerMock }
      ]
    }).compile()

    userService = module.get<UserService>(UserService)
    emailService = module.get<EmailService>(EmailService)
    mailer = module.get<MailerService>(MailerService)
    cache = module.get(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(userService).toBeDefined()
  })

  it('get token', async () => {
    const ret = await userService.getTokenFromCache(PASSWORD_RESET_TOKEN_KEY)

    expect(ret).toEqual(PASSWORD_RESET_TOKEN)
  })

  it('set token', async () => {
    const spy = jest.spyOn(cache, 'set')

    await userService.createTokenInCache(
      PASSWORD_RESET_TOKEN_KEY,
      PASSWORD_RESET_TOKEN,
      TIME_TO_LIVE
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(PASSWORD_RESET_TOKEN_KEY)
    expect(spy.mock.calls[0][1]).toBe(PASSWORD_RESET_TOKEN)
    expect(spy.mock.calls[0][2]).toEqual({ ttl: TIME_TO_LIVE })
  })

  it('delete token', async () => {
    const spy = jest.spyOn(cache, 'del')

    await userService.deleteTokenFromCache(PASSWORD_RESET_TOKEN_KEY)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(PASSWORD_RESET_TOKEN_KEY)
  })

  describe('create a password reset token and send it to given email', () => {
    let getUserCredentialByEmailSpy
    let sendMailSpy
    let sendPasswordResetLinkSpy

    beforeEach(() => {
      getUserCredentialByEmailSpy = jest
        .spyOn(userService, 'getUserCredentialByEmail')
        .mockResolvedValue(user)

      sendMailSpy = jest
        .spyOn(mailer, 'sendMail')
        .mockResolvedValue(expectedEmailInfo)

      sendPasswordResetLinkSpy = jest
        .spyOn(emailService, 'sendPasswordResetLink')
        .mockResolvedValueOnce(expectedEmailInfo)
    })

    it('check if user email exist (Non-Exist)', async () => {
      getUserCredentialByEmailSpy = jest
        .spyOn(userService, 'getUserCredentialByEmail')
        .mockReturnValueOnce(Promise.resolve(null))
      expect(async () => {
        await userService.createTokenAndSendEmail({ email: EMAIL_ADDRESS })
      }).rejects.toThrowError(InvalidUserException)
    })

    it('if user email exist, create token and send email', async () => {
      const tokenGeneratorSpy = jest.spyOn(
        userService,
        'createBase64UrlEncodedTokenRandomly'
      )
      await userService.createTokenAndSendEmail({ email: EMAIL_ADDRESS })
      expect(sendPasswordResetLinkSpy).toBeCalledTimes(1)
      expect(sendPasswordResetLinkSpy.mock.calls[0][0]).toBe(EMAIL_ADDRESS)
      expect(sendPasswordResetLinkSpy.mock.calls[0][1]).toBe(USER_ID)
      expect(tokenGeneratorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('update user password if given token is valid', () => {
    beforeEach(() => {
      userService.updateUserPasswordInPrisma = jest.fn()
      userService.getTokenFromCache = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(PASSWORD_RESET_TOKEN))
    })

    it('token is valid', async () => {
      const returnMessage = await userService.updatePassword(
        1,
        PASSWORD_RESET_TOKEN,
        {
          newPassword: NEW_PASSWORD
        }
      )
      expect(returnMessage).toEqual('Password Reset successfully')
    })

    it('token is invalid', async () => {
      userService.getTokenFromCache = jest
        .fn()
        .mockReturnValueOnce('reset_token_invalid')
        .mockReturnValueOnce(null)

      expect(async () => {
        await userService.updatePassword(USER_ID, PASSWORD_RESET_TOKEN, {
          newPassword: NEW_PASSWORD
        })
      }).rejects.toThrowError(InvalidTokenException)

      expect(async () => {
        await userService.updatePassword(USER_ID, PASSWORD_RESET_TOKEN, {
          newPassword: NEW_PASSWORD
        })
      }).rejects.toThrowError(InvalidTokenException)
    })

    it('check if deleteToken function is called', async () => {
      const deleteTokenSpy = jest.spyOn(userService, 'deleteTokenFromCache')
      await userService.updatePassword(USER_ID, PASSWORD_RESET_TOKEN, {
        newPassword: NEW_PASSWORD
      })
      expect(deleteTokenSpy).toHaveBeenCalledTimes(1)
      expect(deleteTokenSpy.mock.calls[0][0]).toBe(
        passwordResetTokenCacheKey(USER_ID)
      )
    })

    it('check if updatePasswordInPrisma function is called', async () => {
      const updatePasswordInPrismaSpy = jest.spyOn(
        userService,
        'updateUserPasswordInPrisma'
      )
      await userService.updatePassword(USER_ID, PASSWORD_RESET_TOKEN, {
        newPassword: NEW_PASSWORD
      })
      expect(updatePasswordInPrismaSpy).toHaveBeenCalledTimes(1)
      expect(updatePasswordInPrismaSpy.mock.calls[0][0]).toBe(USER_ID)
      expect(updatePasswordInPrismaSpy.mock.calls[0][1]).toBe(NEW_PASSWORD)
    })
  })
})
