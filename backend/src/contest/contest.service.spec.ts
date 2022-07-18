import { ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Contest, ContestType, Group, UserGroup } from '@prisma/client'
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

const mockPrismaService = {
  contest: {
    findUnique: jest.fn().mockResolvedValue(contest),
    create: jest.fn().mockResolvedValue(contest),
    update: jest.fn().mockResolvedValue(contest),
    delete: jest.fn()
  }
}

// const contest: Partial<Contest> = {
//   id: contestId,
//   title: 'title',
//   description: 'description',
//   start_time: new Date('2021-11-07T18:34:23.999175+09:00'),
//   end_time: new Date('2021-12-07T18:34:23.999175+09:00'),
//   visible: true,
//   group_id: groupId,
//   type: 'ACM'
// }

const ongoingContests: Partial<Contest>[] = [
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

const finishedContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 3,
    visible: false
  },
  {
    ...contest,
    id: contestId + 4
  },
  {
    ...contest,
    group_id: groupId + 1,
    id: contestId + 5
  }
]

const upcomingContests: Partial<Contest>[] = [
  {
    ...contest,
    id: contestId + 6,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-12-07T18:34:23.999175+09:00'),
    visible: false
  },
  {
    ...contest,
    id: contestId + 7,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  },
  {
    ...contest,
    group_id: groupId + 1,
    id: contestId + 8,
    start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
    end_time: new Date('2022-11-07T18:34:23.999175+09:00')
  }
]

const userGroup: UserGroup = {
  id: 1,
  user_id: userId,
  group_id: groupId,
  is_registered: true,
  is_group_manager: true,
  create_time: new Date(),
  update_time: new Date()
}

const group: Group = {
  id: groupId,
  created_by_id: userId,
  group_name: 'groupname',
  private: true,
  invitation_code: 'invitation code',
  description: 'description',
  create_time: new Date(),
  update_time: new Date()
}

const adminContestArray: Partial<Contest>[] = ongoingContests
  .slice(0, 1)
  .concat(finishedContests.slice(0, 1), upcomingContests.slice(0, 1))

const returnAdminContests = {
  id: groupId,
  group_name: 'groupname',
  Contest: adminContestArray
}
const returnAdminOngoingContests = {
  ...returnAdminContests,
  Contest: ongoingContests
}
const db = {
  contest: {
    findMany: jest.fn().mockResolvedValue(finishedContests),
    findUnique: jest.fn().mockResolvedValue(contest),
    findFirst: jest.fn().mockResolvedValue(contest)
  },
  userGroup: {
    findFirst: jest.fn().mockResolvedValue(userGroup)
  },
  group: {
    findMany: jest.fn().mockResolvedValue(returnAdminContests),
    findUnique: jest.fn().mockResolvedValue(group)
  }
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

  /* public */
  describe('getOngoingContests', () => {
    it('진행중인 모든 대회 리스트를 반환한다.', async () => {
      db.contest.findMany.mockResolvedValue(ongoingContests)
      const contests = await service.getOngoingContests()
      expect(contests).toEqual(ongoingContests)
    })
  })

  describe('getUpcomingContests', () => {
    it('아직 시작하지 않은 모든 대회 리스트를 반환한다.', async () => {
      db.contest.findMany.mockResolvedValue(upcomingContests)
      const contests = await service.getUpcomingContests()
      expect(contests).toEqual(upcomingContests)
    })
  })

  describe('getFinishedContests', () => {
    db.contest.findMany.mockResolvedValue(finishedContests)
    it('마감된 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getFinishedContests()
      expect(contests).toEqual(finishedContests)
    })
  })

  describe('getContestById', () => {
    beforeEach(() => {
      db.contest.findUnique.mockResolvedValue(contest),
        db.userGroup.findFirst.mockResolvedValue(userGroup)
    })

    it('contest id에 해당하는 contest가 없다면 EntityNotExistException을 반환한다.', async () => {
      db.contest.findUnique.mockResolvedValue(null)
      await expect(service.getContestById(userId, contestId)).rejects.toThrow(
        EntityNotExistException
      )
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 진행중인 상태면 InvalidUserException을 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      db.contest.findUnique.mockResolvedValue({
        ...contest,
        start_time: new Date('2022-11-07T18:34:23.999175+09:00'),
        end_time: new Date('2022-12-07T18:34:23.999175+09:00')
      }) //ongoing
      const result = await service.getContestById(userId, contestId)
      expect(result).rejects.toThrow(InvalidUserException)
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 아직 시작되지 않은 상태면 InvalidUserException을 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      db.contest.findUnique.mockResolvedValue({
        ...contest,
        end_time: new Date('2022-11-07T18:34:23.999175+09:00')
      }) //upcoming
      const result = await service.getContestById(userId, contestId)
      expect(result).rejects.toThrow(ForbiddenException)
    })

    it('user가 contest가 속한 group의 멤버가 아니고, contest가 끝난 상태면 contest id에 해당하는 contest를 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      const result = await service.getContestById(userId, contestId)
      expect(result).toEqual(contest)
    })

    it('user가 contest가 속한 group의 멤버지만, visible==false 이고 user가 group manager가 아니라면 InvalidUserException을 반환한다.', async () => {
      db.contest.findUnique.mockResolvedValue({
        ...contest,
        visible: false
      })
      db.userGroup.findFirst.mockResolvedValue({
        ...userGroup,
        is_group_manager: false
      })
      const result = await service.getContestById(userId, contestId)
      expect(result).rejects.toThrow(ForbiddenException)
    })

    it('user가 contest가 속한 group의 멤버라면 주어진 contest id에 해당하는 대회를 반환한다.', async () => {
      const result = await service.getContestById(userId, contestId)
      expect(result).toEqual(contest)
    })
  })

  /* group */
  describe('getContestsByGroupId', () => {
    beforeEach(() => {
      db.contest.findUnique.mockResolvedValue(contest),
        db.userGroup.findFirst.mockResolvedValue(userGroup),
        db.group.findUnique.mockResolvedValue(group)
    })

    it('group id에 해당하는 group이 존재하지 않으면 EntityNotExistException을 반환한다.', async () => {
      db.group.findUnique.mockResolvedValue(null)
      await expect(
        service.getContestsByGroupId(userId, groupId)
      ).rejects.toThrow(EntityNotExistException)
    })

    it('user가 group id에 해당하는 group 멤버가 아니면 invalidUserException을 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      await expect(
        service.getContestsByGroupId(userId, groupId)
      ).rejects.toThrow(InvalidUserException)
    })

    it('group id에 해당하는 group이 존재하고, user가 그 group에 소속되어 있다면, 주어진 group id에 해당하는 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getContestsByGroupId(userId, groupId)
      for (const contest in contests) {
        expect(JSON.parse(contest).group_id).toEqual(groupId)
      }
    })
  })

  /* admin */
  describe('getAdminContests', () => {
    beforeEach(() => {
      db.userGroup.findFirst.mockResolvedValue(userGroup)
      db.group.findMany.mockResolvedValue(returnAdminContests)
    })

    it('user가 group manager인 group이 존재하지 않을 때 InvalidUserException을 반환한다.', async () => {
      db.userGroup.findFirst.mockResolvedValue(null)
      await expect(service.getAdminContests(userId)).rejects.toThrow(
        InvalidUserException
      )
    })
    it('user가 group manager인 group의 모든 대회 리스트를 반환한다.', async () => {
      const contests = await service.getAdminContests(userId)
      expect(contests['Contest']).toEqual(adminContestArray)
    })
  })

  describe('getAdminOngoingContests', () => {
    beforeEach(() => {
      db.group.findMany.mockResolvedValue(returnAdminOngoingContests)
    })
    it('user가 group manager인 group의 모든 진행중인 대회 리스트를 반환한다.', async () => {
      const contests = await service.getAdminOngoingContests(userId)
      expect(contests['Contest']).toEqual(ongoingContests)
    })
  })
})
