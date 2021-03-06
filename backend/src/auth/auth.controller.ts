import {
  Controller,
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  InternalServerErrorException
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'

import {
  InvalidJwtTokenException,
  InvalidUserException
} from '../common/exception/business.exception'

import {
  REFRESH_TOKEN_COOKIE_OPTIONS,
  AUTH_TYPE
} from './constants/jwt.constants'
import { LoginUserDto } from './dto/login-user.dto'
import { AuthenticatedRequest } from './interface/authenticated-request.interface'
import { JwtTokens } from './interface/jwt.interface'
import { Public } from 'src/common/decorator/public.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  setJwtResponse = (res: Response, jwtTokens: JwtTokens) => {
    res.setHeader('authorization', `${AUTH_TYPE} ${jwtTokens.accessToken}`)
    res.cookie(
      'refresh_token',
      jwtTokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    )
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const jwtTokens = await this.authService.issueJwtTokens(loginUserDto)
      this.setJwtResponse(res, jwtTokens)
      return
    } catch (error) {
      if (error instanceof InvalidUserException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException('Login failed')
    }
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      await this.authService.deleteRefreshToken(req.user.id)
      res.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS)
      return
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('reissue')
  async reIssueJwtTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('Invalid Token')

    try {
      const newJwtTokens = await this.authService.updateJwtTokens(refreshToken)
      this.setJwtResponse(res, newJwtTokens)
      return
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException('Failed to reissue tokens')
    }
  }
}
