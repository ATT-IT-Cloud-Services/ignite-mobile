# Team Manager — Mobile parity

Web-first delivery for Business Team Manager (elizon+ for teams).

## Implemented on web

- Team CRUD, invites (email/link), roles/permissions
- Groups/budgets, projects, org-managed settings locks
- Seat billing on owner elizon+ TEAMS subscription

## Mobile minimum

Until dedicated screens ship:

- `/api/auth/me` exposes `teamId`, `teamRole`, `teamPermissions`, `teamManagedFlags`, `teamElizonPlusActive`
- Hide self-serve payment-method / account-deletion UX when `teamManagedFlags.orgManaged*` is true
- Invite accept can deep-link to web: `/dashboard/team/invite/:token`

No mobile Team Manager screens in v1.
