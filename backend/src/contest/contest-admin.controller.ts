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

@Controller('contest/admin')
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  /* group admin page */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAdminContests(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAdminContests(userId)
  }

  @Get('ongoing')
  @UseGuards(JwtAuthGuard)
  async getAdminOngoingContests(@Req() req: AuthenticatedRequest) {
    return await this.contestService.getAdminOngoingContests(req.user.id)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAdminContestById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    try {
      const contests = await this.contestService.getAdminContestById(
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