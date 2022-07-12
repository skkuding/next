import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards
} from '@nestjs/common'
import { Contest } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getContestById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    return await this.contestService.getContestById(req.user.id, contestId)
  }
}

@Controller('contest/group')
export class ContestGroupController {
  constructor(private readonly contestService: ContestService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getContestsByGroupId(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) groupId: number
  ) {
    return await this.contestService.getContestsByGroupId(req.user.id, groupId)
  }
}
