import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import {
  EntityNotExistException,
  InvalidUserException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { SignUpDto } from './dto/sign-up.dto'
import { WithdrawalDto } from './dto/withdrawal.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      await this.userService.signUp(signUpDto)
      return
    } catch (error) {
      if (error instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }

  @Post('/withdrawal')
  @UseGuards(JwtAuthGuard)
  async withdrawal(
    @Req() req: AuthenticatedRequest,
    @Body() withdrawalDto: WithdrawalDto
  ) {
    try {
      await this.userService.withdrawal(req.user.username, withdrawalDto)
      return
    } catch (error) {
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      }

      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }

      throw new InternalServerErrorException()
    }
  }
}
