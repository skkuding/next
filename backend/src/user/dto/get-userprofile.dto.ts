export class GetUserProfileDto {
  readonly username: string

  readonly role: string

  readonly email: string

  readonly last_login: Date

  readonly update_time: Date

  readonly UserProfile: { real_name: string }
}
