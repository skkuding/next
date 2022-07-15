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

  /* public */
  async getOngoingContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    return this.filterOngoing(allContest)
  }

  async getUpcomingContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.start_time > new Date()
    )
    return returnContest
  }

  async getFinishedContests(): Promise<Partial<Contest>[]> {
    const allContest = await this.prisma.contest.findMany(
      userContestListPageOption
    )
    const returnContest = allContest.filter(
      (contest) => contest.end_time <= new Date()
    )
    return returnContest
  }

  async getContestById(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: contestListselectOption
    })
    if (!contest) {
      throw new EntityNotExistException(`contest ${contest_id}`)
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: { user_id, group_id: contest.group_id, is_registered: true },
      select: { is_group_manager: true }
    })
    if (
      (!isUserInGroup && contest.end_time > new Date()) ||
      (contest.visible == false && isUserInGroup.is_group_manager == false)
    ) {
      throw new InvalidUserException(
        `Contest ${contest_id} is not allowed to user ${user_id}`
      )
    }
    return contest
  }

  /* group */
  async getContestsByGroupId(user_id: number, group_id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: group_id }
    })
    if (!group) {
      throw new EntityNotExistException(`group ${group_id}`)
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: { user_id, group_id, is_registered: true }
    })
    if (!isUserInGroup) {
      throw new InvalidUserException(
        `User ${user_id} is not in Group ${group_id}`
      )
    }
    return await this.prisma.contest.findMany({
      where: { group_id, visible: true },
      select: contestListselectOption
    })

    // return await this.prisma.userGroup.findFirst({
    //   where: { user_id, group_id, is_registered: true },
    //   select: {
    //     group: {
    //       select: {
    //         Contest: {
    //           where: { group_id, visible: true },
    //           select: contestListselectOption
    //         }
    //       }
    //     }
    //   }
    // })
  }

  /* admin */
  async getAdminContests(user_id: number) {
    return await this.prisma.userGroup.findFirst({
      where: {
        user_id,
        is_group_manager: true
      },
      select: {
        group: {
          select: {
            group_name: true,
            Contest: true
          }
        }
      }
    })
  }

  async getAdminOngoingContests(user_id: number) {
    const allContest = await this.getAdminContests(user_id)
    return this.filterOngoing(allContest)
  }

  // Todo: check select option
  async getAdminContestById(
    user_id: number,
    contest_id: number
  ): Promise<Partial<Contest>> {
    // 뒤에서 contest db 너무 들고오길래 처음에 contest id만 가져와서 확인하게 해둠
    const contestGroupId = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: { group_id: true }
    })

    if (!contestGroupId) {
      throw new EntityNotExistException(`contest ${contest_id}`)
    }
    const isUserInGroup = await this.prisma.userGroup.findFirst({
      where: {
        user_id,
        group_id: contestGroupId.group_id,
        is_group_manager: true
      },
      select: { is_group_manager: true }
    })
    if (!isUserInGroup) {
      throw new InvalidUserException(
        `Contest ${contest_id} is not allowed to user ${user_id}`
      )
    }

    const contest = await this.prisma.contest.findUnique({
      where: { id: contest_id },
      select: {
        title: true,
        // Todo: notice list (add display id)
        ContestNotice: {
          select: {
            id: true,
            title: true,
            update_time: true
            //,display_id: true
          }
        },
        // problem list
        ContestProblem: {
          select: {
            problem: {
              select: { title: true, difficulty: true, update_time: true }
            }
          }
        },
        // Todo: submission list (add student id)
        Submission: {
          select: {
            create_time: true, // == submission time
            user: true, // user : {select: {student_id:true}}
            problem: {
              select: { title: true, source: true }
            },
            language: true,
            SubmissionResult: true
          }
        }
      }
    })
    return contest
  }
}
