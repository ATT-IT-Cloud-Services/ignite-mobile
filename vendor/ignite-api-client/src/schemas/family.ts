export interface FamilyGroup {
  id: string;
  name: string;
  status?: string;
  [key: string]: unknown;
}

export interface FamilyMember {
  id: string;
  userId: string;
  role: string;
  [key: string]: unknown;
}

export interface FamilyInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  [key: string]: unknown;
}

export interface FamilyPendingInvite {
  id: string;
  token: string;
  role: string;
  status: string;
  expiresAt: string;
  familyGroup: { id: string; name: string; status?: string };
  invitedBy?: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
    email?: string;
  };
  [key: string]: unknown;
}

export interface FamilyGroupResponse {
  success: boolean;
  group: FamilyGroup | null;
  /** Open invitations addressed to the current user (only when no group yet). */
  pendingInvites?: FamilyPendingInvite[];
}

export interface FamilyMembersResponse {
  success: boolean;
  members: FamilyMember[];
}

export interface FamilyInvitesResponse {
  success: boolean;
  invites: FamilyInvite[];
}

export interface FamilyBalanceRequest {
  id: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

export interface FamilyBalanceRequestsResponse {
  success: boolean;
  requests: FamilyBalanceRequest[];
}
