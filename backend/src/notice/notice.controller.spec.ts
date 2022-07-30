import { Test, TestingModule } from '@nestjs/testing'
import {
  PublicNoticeController,
  GroupNoticeController
} from './notice.controller'
import { NoticeAdminController } from './notice-admin.controller'
import { NoticeService } from './notice.service'
import { GroupService } from 'src/group/group.service'
import { UserService } from 'src/user/user.service'

describe('PublicNoticeController', () => {
  let controller: PublicNoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicNoticeController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<PublicNoticeController>(PublicNoticeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

describe('GroupNoticeController', () => {
  let controller: GroupNoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupNoticeController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupNoticeController>(GroupNoticeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

describe('NoticeAdminController', () => {
  let controller: NoticeAdminController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeAdminController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<NoticeAdminController>(NoticeAdminController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

describe('GroupNoticeAdminController', () => {
  let controller: NoticeAdminController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeAdminController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<NoticeAdminController>(NoticeAdminController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
