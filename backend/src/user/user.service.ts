import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SignUpDto } from './dto/sign-up.dto'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { User, UserProfile } from '@prisma/client'
import { encrypt } from 'src/common/hash'
import { CreateUserProfileData } from './interface/create-userprofile.interface'
import { GroupService } from 'src/group/group.service'
import { UserGroupData } from 'src/group/interface/user-group-data.interface'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { AuthService } from 'src/auth/auth.service'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly authService: AuthService
  ) {}

  async getUserRole(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      }
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
    const CreateUserProfileData: CreateUserProfileData = {
      user_id: user.id,
      real_name: signUpDto.real_name
    }
    await this.createUserProfile(CreateUserProfileData)
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
    CreateUserProfileData: CreateUserProfileData
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.create({
      data: {
        real_name: CreateUserProfileData.real_name,
        user: {
          connect: { id: CreateUserProfileData.user_id }
        }
      }
    })
  }

  async registerUserToPublicGroup(userId: number) {
    const userGroupData: UserGroupData = {
      user_id: userId,
      group_id: 1,
      is_registerd: true,
      is_group_manager: false
    }
    await this.groupService.createUserGroup(userGroupData)
  }

  async withdrawal(username: string, withdrawalDto: WithdrawalDto) {
    const user = await this.getUserCredential(username)

    if (!(await this.authService.isValidUser(user, withdrawalDto.password))) {
      throw new InvalidUserException('Incorrect password')
    }

    this.deleteUser(username)
  }

  async getUserCredential(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    })
  }

  async deleteUser(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username
      }
    })

    if (!user) {
      throw new EntityNotExistException('User')
    }

    await this.prisma.user.delete({
      where: {
        username
      }
    })
  }
}
