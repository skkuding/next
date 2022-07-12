import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { Contest } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { EntityNotExistException } from 'src/common/exception/business.exception'
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
    try {
      const contests = await this.contestService.getContestById(
        req.user.id,
        contestId
      )
      return contests
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new UnauthorizedException(error.message)
    }
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
    try {
      const contests = await this.contestService.getContestsByGroupId(
        req.user.id,
        groupId
      )
      return contests
    } catch (error) {
      throw new NotFoundException(error.message)
    }
  }
}
