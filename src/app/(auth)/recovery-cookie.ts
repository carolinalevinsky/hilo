/**
 * The marker that says "this session came from a recovery link".
 *
 * Setting a password without knowing the old one is allowed for exactly one
 * reason: the person proved they can read the account's inbox. A session on its
 * own is not that proof — an unlocked laptop in a consulting room is also a
 * session, and without this cookie whoever walked past it could take the account
 * over silently.
 *
 * So `/confirmar` sets it when it consumes a recovery link, `/nueva-contrasena`
 * refuses to render or act without it, and the action deletes it the moment the
 * password changes. Scoped to that one path so it is not attached to any other
 * request, `httpOnly` so no script can read it, and short-lived because the
 * whole flow takes a minute.
 */
export const RECOVERY_COOKIE = 'hilo-recovery'

/** Where the recovery link lands, and the only path the cookie is sent on. */
export const RECOVERY_PATH = '/nueva-contrasena'

export const RECOVERY_COOKIE_OPTIONS = {
  path: RECOVERY_PATH,
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 15,
} as const
