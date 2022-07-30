import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { GroupService } from '../group.service'

@Injectable()
export class GroupManagerGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const group_id: number = parseInt(request.params.group_id)
    const user_id: number = request.user.id

    try {
      const userGroupMemberShipInfo =
        await this.groupService.getUserGroupMembershipInfo(user_id, group_id)
      if (
        userGroupMemberShipInfo.is_registered &&
        userGroupMemberShipInfo.is_group_manager
      ) {
        return true
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}
    return false
  }
}
