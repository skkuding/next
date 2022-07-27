import { Test, TestingModule } from '@nestjs/testing'
import { Contest, ContestType, UserGroup } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

const contestId = 1
const userId = 1
const groupId = 1

const contest: Contest = {
  id: contestId,
  created_by_id: userId,
  group_id: groupId,
  title: 'title',
  description: 'description',
  description_summary: 'description summary',
  start_time: new Date('2021-11-07T18:34:23.999175+09:00'),
  end_time: new Date('2021-12-07T18:34:23.999175+09:00'),
  visible: true,
  is_rank_visible: true,
  type: ContestType.ACM,
  create_time: new Date(),
  update_time: new Date()
}

const ongoingContests: Contest[] = [
  {
    ...contest,
    id: contestId,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    visible: false
  },
  {
    ...contest,
    id: contestId + 1,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  },
  {
    ...contest,
    id: contestId + 2,
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  }
]

const ongoingContest: Contest = ongoingContests[0]

const userGroup: UserGroup = {
  id: 1,
  user_id: userId,
  group_id: groupId,
  is_registered: true,
  is_group_manager: true,
  create_time: new Date(),
  update_time: new Date()
}
const userGroups: UserGroup[] = [
  userGroup,
  {
    ...userGroup,
    id: userGroup.id + 1,
    group_id: userGroup.group_id + 1
  }
]

const record = {
  id: 1,
  contest_id: contestId,
  user_id: userId,
  rank: 1,
  create_time: new Date(),
  update_time: new Date()
}

const contestRankACM = {
  id: 1,
  contest_id: contestId,
  user_id: userId,
  accepted_problem_num: 0,
  total_penalty: 0,
  submission_info: {},
  create_time: new Date(),
  update_time: new Date()
}

const mockPrismaService = {
  contest: {
    findUnique: jest.fn().mockResolvedValue(contest),
    create: jest.fn().mockResolvedValue(contest),
    update: jest.fn().mockResolvedValue(contest),
    delete: jest.fn()
  },
  contestRecord: {
    findFirst: jest.fn().mockResolvedValue(null)
  },
  userGroup: {
    findFirst: jest.fn().mockResolvedValue(userGroup),
    findMany: jest.fn().mockResolvedValue(userGroups)
  },
  contestRankACM: {
    create: jest.fn().mockResolvedValue(contestRankACM)
  }
}

function returnTextIsNotAllowed(userId: number, contestId: number): string {
  return `Contest ${contestId} is not allowed to User ${contestId}`
}
describe('ContestService', () => {
  let service: ContestService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    service = module.get<ContestService>(ContestService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createContest', () => {
    const createContestDto: CreateContestDto = {
      group_id: contest.group_id,
      title: contest.title,
      description: contest.description,
      description_summary: contest.description_summary,
      start_time: contest.start_time,
      end_time: contest.end_time,
      visible: contest.visible,
      is_rank_visible: contest.is_rank_visible,
      type: contest.type
    }

    afterEach(() => {
      mockPrismaService.contest.create.mockClear()
    })

    it('should return created contest', async () => {
      //given

      //when
      const result = await service.createContest(userId, createContestDto)

      //then
      expect(mockPrismaService.contest.create).toBeCalledTimes(1)
      expect(result).toEqual(contest)
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = jest
        .spyOn(service, 'isValidPeriod')
        .mockReturnValue(false)

      //when
      const callContestCreate = async () =>
        await service.createContest(userId, createContestDto)

      //then
      await expect(callContestCreate).rejects.toThrow(
        UnprocessableDataException
      )
      expect(mockPrismaService.contest.create).toBeCalledTimes(0)

      isValidPeriodSpy.mockRestore()
    })
  })

  describe('updateContest', () => {
    let callUpdateContest
    const updateContestDto: UpdateContestDto = {
      title: contest.title,
      description: contest.description,
      description_summary: contest.description_summary,
      start_time: contest.start_time,
      end_time: contest.end_time,
      visible: contest.visible,
      is_rank_visible: contest.is_rank_visible,
      type: contest.type
    }

    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
      callUpdateContest = async () =>
        await service.updateContest(contestId, updateContestDto)
    })
    afterEach(() => {
      mockPrismaService.contest.update.mockClear()
    })

    it('should return updated contest', async () => {
      //given

      //when
      const result = await service.updateContest(contestId, updateContestDto)

      //then
      expect(mockPrismaService.contest.update).toBeCalledTimes(1)
      expect(result).toBe(contest)
    })

    it('should throw error when the contest does not exist', async () => {
      //given
      mockPrismaService.contest.findUnique.mockResolvedValue(null)

      //when

      //then
      await expect(
        service.updateContest(contestId, updateContestDto)
      ).rejects.toThrow(EntityNotExistException)
      expect(mockPrismaService.contest.update).toBeCalledTimes(0)
    })

    it('should throw error when given contest period is not valid', async () => {
      //given
      const isValidPeriodSpy = jest
        .spyOn(service, 'isValidPeriod')
        .mockReturnValue(false)

      //when

      //then
      await expect(callUpdateContest).rejects.toThrow(
        UnprocessableDataException
      )
      expect(mockPrismaService.contest.update).toBeCalledTimes(0)

      isValidPeriodSpy.mockRestore()
    })
  })

  describe('isValidPeriod', () => {
    const startTime = new Date()
    const endTime = new Date()

    it('should return true when given valid start time and end time', () => {
      //given
      endTime.setDate(startTime.getDate() + 1)

      //when
      const result = service.isValidPeriod(startTime, endTime)

      //then
      expect(result).toBe(true)
    })

    it('should return false when end time is ealier than start time', () => {
      //given
      endTime.setDate(startTime.getDate() - 1)

      //when
      const result = service.isValidPeriod(startTime, endTime)

      //then
      expect(result).toBeFalsy()
    })
  })

  describe('deleteContest', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
    })
    afterEach(() => {
      mockPrismaService.contest.delete.mockClear()
    })

    it('should successfully delete the contest', async () => {
      //given

      //when
      await service.deleteContest(contestId)

      //then
      expect(mockPrismaService.contest.delete).toBeCalledTimes(1)
    })

    it('should throw error when contest does not exist', async () => {
      //given
      mockPrismaService.contest.findUnique.mockResolvedValue(null)

      //when
      const callContestDelete = async () =>
        await service.deleteContest(contestId)

      //then
      await expect(callContestDelete).rejects.toThrow(EntityNotExistException)
      expect(mockPrismaService.contest.delete).toBeCalledTimes(0)
    })
  })

  describe('createContestRecord', () => {
    beforeEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(ongoingContest)
      mockPrismaService.contestRecord.findFirst.mockResolvedValue(null)
      mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)
    })
    afterEach(() => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
      mockPrismaService.contestRecord.findFirst.mockResolvedValue(null)
      mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)
      mockPrismaService.contest.create.mockClear()
    })

    it('contest id에 해당하는 contest가 없다면 EntityNotExistException을 반환한다.', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(null)
      await expect(
        service.createContestRecord(userId, contestId, groupId)
      ).rejects.toThrowError(
        new EntityNotExistException(`Contest ${contestId}`)
      )
    })

    it('contest를 중복 참여하는 경우, InvalidUserException을 반환한다.', async () => {
      mockPrismaService.contestRecord.findFirst.mockResolvedValue(record)
      await expect(
        service.createContestRecord(userId, contestId, groupId)
      ).rejects.toThrowError(
        new InvalidUserException(
          `User ${userId} is already participated in Contest ${contestId}`
        )
      )
    })

    it('사용자가 속하지 않은 그룹의 contest일 경우 InvalidUserException을 반환한다.', async () => {
      mockPrismaService.userGroup.findFirst.mockResolvedValue(null)
      await expect(
        service.createContestRecord(userId, contestId, groupId + 1)
      ).rejects.toThrowError(
        new InvalidUserException(returnTextIsNotAllowed(userId, contestId))
      )
    })

    it('public contest이거나 사용자가 속하는 그룹의 contest지만 contest가 진행 중이 아닐때 InvalidUserException을 반환한다.', async () => {
      mockPrismaService.contest.findUnique.mockResolvedValue(contest)
      await expect(
        service.createContestRecord(userId, contestId, groupId)
      ).rejects.toThrowError(
        new InvalidUserException(returnTextIsNotAllowed(userId, contestId))
      )
    })

    it('contest type이 ACM이면 contestRankACM을 생성한다.', async () => {
      await service.createContestRecord(userId, contestId, groupId)
      expect(mockPrismaService.contestRankACM.create).toBeCalledTimes(1)
      // Todo ?: check value
    })

    // Todo: test other contest type -> create other contest record table
  })
})
