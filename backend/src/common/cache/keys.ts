export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const pwResetTokenCacheKey = (userId: number) => `pw-reset:${userId}`
