import type { Access, FieldAccess } from 'payload'
import {
  canAccessAdminPanel,
  canManageBrands,
  canManageUsers,
  canReadBrands,
  canReadDietary,
  canReadOperational,
  canWriteCulinary,
  canWriteDietary,
  canWriteMedia,
  canWriteOperational,
  isAdmin,
  isAuthenticated,
  isDirector,
  type PlateUserLike,
} from './roles'

function userFromReq(req: { user?: PlateUserLike }): PlateUserLike {
  return req.user ?? null
}

/** Deny-by-default: authenticated internal staff only (read). */
export const authenticatedStaffRead: Access = ({ req }) =>
  canReadOperational(userFromReq(req))

/** Directors + experience curators may mutate core hospitality records. */
export const operationalWrite: Access = ({ req }) =>
  canWriteOperational(userFromReq(req))

/** Read for internal staff; write for directors + curators. */
export const operationalCollectionAccess = {
  read: authenticatedStaffRead,
  create: operationalWrite,
  update: operationalWrite,
  delete: ({ req }: { req: { user?: PlateUserLike } }) =>
    isDirector(userFromReq(req)),
}

/**
 * Culinary-owned collections (menus): staff read; culinary + directors + curators write.
 */
export const culinaryCollectionAccess = {
  read: authenticatedStaffRead,
  create: ({ req }: { req: { user?: PlateUserLike } }) =>
    canWriteCulinary(userFromReq(req)),
  update: ({ req }: { req: { user?: PlateUserLike } }) =>
    canWriteCulinary(userFromReq(req)),
  delete: ({ req }: { req: { user?: PlateUserLike } }) =>
    isDirector(userFromReq(req)),
}

/**
 * Dietary notes — stricter. Never public. Team role excluded.
 */
export const dietaryNotesAccess = {
  read: ({ req }: { req: { user?: PlateUserLike } }) =>
    canReadDietary(userFromReq(req)),
  create: ({ req }: { req: { user?: PlateUserLike } }) =>
    canWriteDietary(userFromReq(req)),
  update: ({ req }: { req: { user?: PlateUserLike } }) =>
    canWriteDietary(userFromReq(req)),
  delete: ({ req }: { req: { user?: PlateUserLike } }) =>
    isDirector(userFromReq(req)),
}

/**
 * Tasks: staff can read; directors/curators/team can create/update; directors delete.
 */
export const tasksCollectionAccess = {
  read: authenticatedStaffRead,
  create: ({ req }: { req: { user?: PlateUserLike } }) => {
    const user = userFromReq(req)
    return canWriteOperational(user) || Boolean(user && user.role === 'team')
  },
  update: ({ req }: { req: { user?: PlateUserLike } }) => {
    const user = userFromReq(req)
    return canWriteOperational(user) || Boolean(user && user.role === 'team')
  },
  delete: ({ req }: { req: { user?: PlateUserLike } }) =>
    isDirector(userFromReq(req)),
}

/**
 * Brands / platform: directors manage; other staff may read for relationship fields.
 */
export const brandsCollectionAccess = {
  read: ({ req }: { req: { user?: PlateUserLike } }) =>
    canReadBrands(userFromReq(req)),
  create: ({ req }: { req: { user?: PlateUserLike } }) =>
    canManageBrands(userFromReq(req)),
  update: ({ req }: { req: { user?: PlateUserLike } }) =>
    canManageBrands(userFromReq(req)),
  delete: ({ req }: { req: { user?: PlateUserLike } }) =>
    isAdmin(userFromReq(req)),
}

/**
 * Media: public read preserves website/image delivery.
 * Mutations restricted to internal staff.
 * Private documents must not share this collection long-term (see Phase 0 report).
 */
export const mediaCollectionAccess = {
  read: () => true,
  create: ({ req }: { req: { user?: PlateUserLike } }) =>
    canWriteMedia(userFromReq(req)),
  update: ({ req }: { req: { user?: PlateUserLike } }) =>
    canWriteMedia(userFromReq(req)),
  delete: ({ req }: { req: { user?: PlateUserLike } }) =>
    isDirector(userFromReq(req)),
}

/**
 * Users / auth collection.
 * - Admin panel entry gated by canAccessAdminPanel
 * - Create: admin, or first-user bootstrap when DB has zero users
 * - Read/update: self or admin
 * - Delete: admin only
 */
export const usersCollectionAccess = {
  admin: ({ req }: { req: { user?: PlateUserLike } }) =>
    canAccessAdminPanel(userFromReq(req)),

  read: ({ req }: { req: { user?: PlateUserLike } }) => {
    const user = userFromReq(req)
    if (!isAuthenticated(user)) return false
    if (isAdmin(user)) return true
    return {
      id: {
        equals: user!.id,
      },
    }
  },

  create: (async ({ req }) => {
    if (isAdmin(userFromReq(req))) return true

    // First-user bootstrap (empty Users collection)
    if (!req.user) {
      const result = await req.payload.count({
        collection: 'users',
        overrideAccess: true,
      })
      return result.totalDocs === 0
    }

    return false
  }) as Access,

  update: ({ req }: { req: { user?: PlateUserLike } }) => {
    const user = userFromReq(req)
    if (!isAuthenticated(user)) return false
    if (isAdmin(user)) return true
    return {
      id: {
        equals: user!.id,
      },
    }
  },

  delete: ({ req }: { req: { user?: PlateUserLike } }) =>
    canManageUsers(userFromReq(req)),
}

/** Only admins may change the role field (privilege-escalation guard). */
export const roleFieldAccess: FieldAccess = ({ req }) =>
  isAdmin(userFromReq(req))

/** Internal notes on users — directors+ only */
export const userInternalNotesFieldAccess: FieldAccess = ({ req }) =>
  isDirector(userFromReq(req))
