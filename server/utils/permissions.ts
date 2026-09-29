import { Permission, PlatformRole } from '../../src/types/index.ts';

export const ROLE_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  admin: [
    'booking.read', 'booking.create', 'booking.update', 'booking.cancel',
    'payment.read', 'refund.create',
    'staff.read', 'staff.manage',
    'service.manage',
    'offer.manage', 'coupon.manage',
    'review.manage',
    'analytics.read',
    'website.manage'
  ],
  owner: [
    'booking.read', 'booking.create', 'booking.update', 'booking.cancel',
    'payment.read', 'refund.create',
    'staff.read', 'staff.manage',
    'service.manage',
    'offer.manage', 'coupon.manage',
    'review.manage',
    'analytics.read',
    'website.manage'
  ],
  branch_manager: [
    'booking.read', 'booking.create', 'booking.update', 'booking.cancel',
    'payment.read',
    'staff.read',
    'service.manage',
    'review.manage',
    'analytics.read'
  ],
  staff: [
    'booking.read', 'booking.update',
    'staff.read'
  ],
  receptionist: [
    'booking.read', 'booking.create', 'booking.update',
    'payment.read'
  ],
  customer: [
    'booking.read', 'booking.create'
  ]
};

export function hasPermission(role: PlatformRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
