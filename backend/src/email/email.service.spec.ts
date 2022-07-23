import { MailerService } from '@nestjs-modules/mailer'
import { Test, TestingModule } from '@nestjs/testing'
import { EmailTransmissionFailedException } from 'src/common/exception/business.exception'
import { EmailService } from './email.service'

describe('EmailService', () => {
  let service: EmailService

  let recipient: string
  let expectedEmailInfo: {
    accepted: string[]
    rejected: string[]
    envelopeTime: number
    messageTime: number
    messageSize: number
    response: string
    envelope: { from: string; to: string[] }
    messageId: string
  }

  const MailerMock = {
    sendMail: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: MailerMock }
      ]
    }).compile()

    service = module.get<EmailService>(EmailService)

    recipient = 'abc@abc.com'

    expectedEmailInfo = {
      accepted: [recipient],
      rejected: [],
      envelopeTime: 715,
      messageTime: 590,
      messageSize: 473,
      response:
        '250 2.0.0 OK  1658043820 q93-56600b001f061359022sm8791552pjk.54 - gsmtp',
      envelope: { from: 'sender@gmail.com', to: [recipient] },
      messageId: '6bd7-3d62-c84b-61865f06534b@gmail.com'
    }
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('Email transmission success', async () => {
    MailerMock.sendMail.mockReturnValueOnce(expectedEmailInfo)
    await service.sendPasswordResetLink(recipient, 123, 'thisistoken')

    expect(MailerMock.sendMail.mock.calls.length).toBe(1)
  })

  it('Email transmission failure', async () => {
    expectedEmailInfo['accepted'] = []
    MailerMock.sendMail.mockReturnValueOnce(Promise.resolve(expectedEmailInfo))

    await expect(async () => {
      await service.sendPasswordResetLink(recipient, 123, 'thisistoken')
    }).rejects.toThrowError(EmailTransmissionFailedException)
  })
})
