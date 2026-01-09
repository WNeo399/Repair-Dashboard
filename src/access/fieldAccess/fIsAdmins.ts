import type { FieldAccess } from 'payload'

import { checkRole } from '../checkRole'

export const fIsAdmins: FieldAccess = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  return checkRole(['admin'], user)
}
