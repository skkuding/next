import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { ContestService } from './contest.service'

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get('ongoing')
  async getOngoingContests(): Promise<Partial<Contest>[]> {
    return await this.contestService.getOngoingContests()
  }

  @Get('upcoming')
  async getUpcomingContests(): Promise<Partial<Contest>[]> {
    return await this.contestService.getUpcomingContests()
  }

  @Get('finished')
  async getFinishedContests(): Promise<Partial<Contest>[]> {
    return await this.contestService.getFinishedContests()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getContestById(
    @Req() req,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    const userId = req.body.user.id
    return await this.contestService.getContestById(userId, contestId)
  }
}

@Controller('contest/group')
export class ContestGroupController {
  constructor(private readonly contestService: ContestService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getContestsByGroupId(
    @Req() req,
    @Param('id', ParseIntPipe) groupId: number
  ) {
    const userId = req.body.user.id
    return await this.contestService.getContestsByGroupId(userId, groupId)
  }
}
