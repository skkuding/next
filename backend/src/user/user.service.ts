import { forwardRef, Inject, Injectable } from '@nestjs/common'
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
import { GetUserProfileDto } from './dto/get-userprofile.dto'
import { UpdateUserRealNameDto } from './dto/update-user-realname.dto'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  async getUserRole(userId: number): Promise<Partial<User>> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      }
    })
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    // TODO: 인증된 Email인지 확인 Cache or JWT

    const duplicatedUser: User = await this.prisma.user.findUnique({
      where: {
        username: signUpDto.username
      }
    })

    if (duplicatedUser) {
      throw new UnprocessableDataException('Username already exists')
    }

    const user: User = await this.createUser(signUpDto)
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
    const user: User = await this.getUserCredential(username)

    if (!(await this.authService.isValidUser(user, withdrawalDto.password))) {
      throw new InvalidUserException('Incorrect password')
    }

    this.deleteUser(username)
  }

  async getUserCredential(username: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { username }
    })
  }

  async deleteUser(username: string) {
    const user: User = await this.prisma.user.findUnique({
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

  async getUserProfile(username: string): Promise<GetUserProfileDto> {
    const userProfile = await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        role: true,
        email: true,
        last_login: true,
        update_time: true,
        UserProfile: {
          select: {
            real_name: true
          }
        }
      }
    })

    if (!userProfile) {
      throw new EntityNotExistException('User')
    }

    return userProfile
  }

  //TODO: implement update email

  async updateUserRealName(
    userId: number,
    updateUserRealNameDto: UpdateUserRealNameDto
  ): Promise<UserProfile> {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { user_id: userId }
    })

    if (!userProfile) {
      throw new EntityNotExistException('UserProfile')
    }

    return await this.prisma.userProfile.update({
      where: { user_id: userId },
      data: {
        real_name: updateUserRealNameDto.real_name
      }
    })
  }
}
