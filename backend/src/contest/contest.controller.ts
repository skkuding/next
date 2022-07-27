import {
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { ContestService } from './contest.service'

@Controller('group/:group_id/contest')
@UseGuards(JwtAuthGuard, GroupMemberGuard)
@Controller()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Post(':id/participation')
  async createContestRecord(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number,
    @Param('group_id', ParseIntPipe) groupId: number
  ): Promise<null | Error> {
    try {
      this.contestService.createContestRecord(req.user.id, contestId, groupId)
      return
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new ForbiddenException(error.message)
    }
  }
}
