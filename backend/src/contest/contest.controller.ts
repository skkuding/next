import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get('ongoing')
  async getOngoingList(): Promise<Partial<Contest>[]> {
    return await this.contestService.getOngoingList()
  }

  @Get('upcoming')
  async getUpcomingList(): Promise<Partial<Contest>[]> {
    return await this.contestService.getUpcomingList()
  }

  @Get('finished')
  async getFinishedList(): Promise<Partial<Contest>[]> {
    return await this.contestService.getFinishedList()
  }

  @Get(':id')
  // Todo: add guard
  async getDetailById(
    @Req() req,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    const userId = req.body.user.id
    return await this.contestService.getDetailById(userId, contestId)
  }
}

@Controller('contest/group')
export class ContestGroupController {
  constructor(private readonly contestService: ContestService) {}

  @Get(':id')
  // Todo: add guard
  async getListByGroupId(
    @Req() req,
    @Param('id', ParseIntPipe) groupId: number
  ) {
    const userId = req.body.user.id
    return await this.contestService.getListByGroupId(userId, groupId)
  }
}
