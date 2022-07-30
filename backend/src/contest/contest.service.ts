import { Injectable } from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

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
    await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    if (!this.isValidPeriod(contestDto.start_time, contestDto.end_time)) {
      throw new UnprocessableDataException(
        'start time must be earlier than end time'
      )
    }

    return await this.prisma.contest.update({
      where: {
        id: contestId
      },
      data: {
        ...contestDto
      }
    })
  }

  isValidPeriod(startTime: Date, endTime: Date): boolean {
    if (startTime > endTime) {
      return false
    }
    return true
  }

  async deleteContest(contestId: number) {
    await this.prisma.contest.findUnique({
      where: {
        id: contestId
      },
      rejectOnNotFound: () => new EntityNotExistException('contest')
    })

    await this.prisma.contest.delete({
      where: {
        id: contestId
      }
    })
  }
}
