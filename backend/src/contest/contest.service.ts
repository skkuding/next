import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'

const contestListselectOption = {
  id: true,
  title: true,
  description: true,
  start_time: true,
  end_time: true,
  visible: true,
  group_id: true,
  type: true
}
const userContestListPageOption = {
  where: { visible: true },
  select: contestListselectOption
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

  filterOngoing(allContest) {
    const now = new Date()
    const ongoingContest = allContest.filter(
      (contest) => contest.start_time <= now && contest.end_time > now
    )
    return ongoingContest
  }

  /* group admin page */
  async getAllAdminContest(user_id: number) {
    return await this.prisma.userGroup.findFirst({
      where: { user_id, is_group_manager: true },
      select: { group: { include: { Contest: true } } }
    })
  }

  async getAdminOngoing(user_id: number) {
    const allContest = await this.getAllAdminContest(user_id)
    return this.filterOngoing(allContest)
  }

  /* User Page */

  /* contest list page */
  async getOngoing(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    return this.filterOngoing(allContest)
  }

  async getUpcoming(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.start_time > new Date()
    )
    return returnContest
  }

  async getFinished(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.end_time <= new Date()
    )
    return returnContest
  }

  async findByGroupId(user_id: number, group_id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: group_id }
    })
    if (!group) {
      throw new NotFoundException()
    }
    return await this.prisma.userGroup.findFirst({
      where: { user_id, group_id, is_registered: true },
      select: {
        group: {
          select: {
            Contest: {
              where: { group_id, visible: true },
              select: contestListselectOption
            }
          }
        }
      }
    })
  }

  /* contest detail page */
  async findByContestId(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: contestListselectOption
    })
    if (!contest) {
      throw new NotFoundException()
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: { user_id, group_id: contest.group_id },
      select: { is_group_manager: true }
    })
    if (
      (!isUserInGroup && contest.end_time > new Date()) ||
      (contest.visible == false && isUserInGroup.is_group_manager == false)
    ) {
      throw new BadRequestException()
    }
    return contest
  }
}
