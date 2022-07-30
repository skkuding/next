import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@prisma/client'
import { ROLES_KEY } from 'src/common/decorator/roles.decorator'
import { UserService } from 'src/user/user.service'
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface'

@Injectable()
export class RolesGuard implements CanActivate {
  #rolesHierarchy = {}

  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService
  ) {
    Object.keys(Role).forEach((key, index) => {
      this.#rolesHierarchy[key] = index
    })
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!role) {
      return true
    }

    const request: AuthenticatedRequest = context.switchToHttp().getRequest()
    const userRole = await this.userService.getUserRole(request.user.id)

    if (this.#rolesHierarchy[userRole.role] >= this.#rolesHierarchy[role]) {
      return true
    }
    return false
  }
}
