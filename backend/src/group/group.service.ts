import { Injectable } from '@nestjs/common'
import { UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserGroupData } from './interface/user-group-data.interface'

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserGroupMembershipInfo(userId: number, groupId: number) {
    return await this.prisma.userGroup.findFirst({
      where: {
        user_id: userId,
        group_id: groupId
      },
      select: {
        is_registered: true,
        is_group_manager: true
      }
    })
  }

  async createUserGroup(userGroupData: UserGroupData): Promise<UserGroup> {
    return await this.prisma.userGroup.create({
      data: {
        user: {
          connect: { id: userGroupData.user_id }
        },
        group: {
          connect: { id: userGroupData.group_id }
        },
        is_registered: userGroupData.is_registerd,
        is_group_manager: userGroupData.is_group_manager
      }
    })
  }
}
