import { CACHE_MANAGER, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Cache } from 'cache-manager'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService
  let prisma: PrismaService
  let cache: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: ConfigService, useValue: {} }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
    prisma = module.get<PrismaService>(PrismaService)
    cache = module.get(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
