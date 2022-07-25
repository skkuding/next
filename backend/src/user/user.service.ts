import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SignUpDto } from './dto/sign-up.dto'
import { UnprocessableDataException } from 'src/common/exception/business.exception'
import { User, UserProfile } from '@prisma/client'
import { encrypt } from 'src/common/hash'
import { UserProfileData } from './interface/user-profile-data.interface'
import { GroupService } from 'src/group/group.service'
import { UserGroupData } from 'src/group/interface/user-group-data.interface'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService
  ) {}

  async getUserRole(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      }
    })
  }

  async getUserCredential(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    })
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    // TODO: 인증된 Email인지 확인 Cache or JWT

    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: signUpDto.username
      }
    })

    if (duplicatedUser) {
      throw new UnprocessableDataException('Username already exists')
    }

    const user = await this.createUser(signUpDto)

    const userProfileData: UserProfileData = {
      user_id: user.id,
      real_name: signUpDto.real_name
    }
    await this.createUserProfile(userProfileData)

    await this.registerUserToPublicGroup(user.id)

    return user
  }

  async createUser(signUpDto: SignUpDto): Promise<User> {
    const encryptedPassword = await encrypt(signUpDto.password)

    return await this.prisma.user.create({
      data: {
        username: signUpDto.username,
        password: encryptedPassword,
        email: signUpDto.email,
        last_login: null
      }
    })
  }

  async createUserProfile(
    userProfileData: UserProfileData
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.create({
      data: {
        real_name: userProfileData.real_name,
        user: {
          connect: { id: userProfileData.user_id }
        }
      }
    })
  }

  async registerUserToPublicGroup(user_id: number) {
    const userGroupData: UserGroupData = {
      user_id,
      group_id: 1,
      is_registerd: true,
      is_group_manager: false
    }
    await this.groupService.createUserGroup(userGroupData)
  }
}
