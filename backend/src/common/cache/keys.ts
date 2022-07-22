export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const passwordResetTokenCacheKey = (userId: number) =>
  `password-reset:${userId}`
