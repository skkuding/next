import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

const PUBLIC = 1

function returnTextIsNotAllowed(user_id: number, contest_id: number): string {
  return `Contest ${contest_id} is not allowed to User ${user_id}`
}

@Injectable()
export class ContestService {
  constructor(private readonly prisma: PrismaService) {}

  async createContest(
    userId: number,
    contestDto: CreateContestDto
  ): Promise<Contest> {
    if (!this.isValidPeriod(contestDto.start_time, contestDto.end_time)) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    const contest: Contest = await this.prisma.contest.create({
      data: {
        title: contestDto.title,
        description: contestDto.description,
        description_summary: contestDto.description_summary,
        start_time: contestDto.start_time,
        end_time: contestDto.end_time,
        visible: contestDto.visible,
        is_rank_visible: contestDto.is_rank_visible,
        type: contestDto.type,
        group: {
          connect: { id: contestDto.group_id }
        },
        created_by: {
          connect: { id: userId }
        }
      }
    })

    return contest
  }

  async updateContest(
    contestId: number,
    contestDto: UpdateContestDto
  ): Promise<Contest> {
    const contest: Contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    if (!this.isValidPeriod(contestDto.start_time, contestDto.end_time)) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    const updated_contest: Contest = await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        ...contestDto
      }
    })

    return updated_contest
  }

  isValidPeriod(startTime: Date, endTime: Date): boolean {
    if (startTime > endTime) {
      return false
    }
    return true
  }

  async deleteContest(contestId: number) {
    const contest: Contest = await this.prisma.contest.findUnique({
      where: {
        id: contestId
      }
    })

    if (!contest) {
      throw new EntityNotExistException('contest')
    }

    await this.prisma.contest.delete({
      where: {
        id: contestId
      }
    })
  }

  // Todo: issue #90
  async createContestRecord(
    user_id: number,
    contest_id: number,
    group_id: number
  ): Promise<null | Error> {
    //contest 존재 여부
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: { start_time: true, end_time: true, type: true }
    })
    if (!contest) {
      throw new EntityNotExistException(`Contest ${contest_id}`)
    }

    //중복 참여 확인 in contestRecord
    const isAlreadyRecord = await this.prisma.contestRecord.findFirst({
      where: { user_id, contest_id },
      select: { id: true }
    })
    if (isAlreadyRecord) {
      throw new InvalidUserException(
        `User ${user_id} is already participated in Contest ${contest_id}`
      )
    }

    //contest private여부 확인
    if (group_id !== PUBLIC) {
      //user group인지 확인
      const isUserInGroup = await this.prisma.userGroup.findFirst({
        where: { user_id, group_id: group_id, is_registered: true },
        select: { id: true }
      })
      //contest group 확인
      if (!isUserInGroup) {
        throw new InvalidUserException(
          returnTextIsNotAllowed(user_id, contest_id)
        )
      }
    }

    //contest start 전 or contest end 후 -> throw
    const now = new Date()
    if (now < contest.start_time || now >= contest.end_time) {
      throw new InvalidUserException(
        returnTextIsNotAllowed(user_id, contest_id)
      )
    }
    //contest type ACM -> create contest rank acm record
    if (contest.type === 'ACM') {
      await this.prisma.contestRankACM.create({
        data: { contest_id, user_id }
      })
    }
    // Todo: other contest type -> create other contest record table

    return
  }
}
