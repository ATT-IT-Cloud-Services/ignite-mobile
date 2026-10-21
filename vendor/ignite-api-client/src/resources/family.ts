import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type {
  FamilyBalanceRequestsResponse,
  FamilyGroupResponse,
  FamilyInvitesResponse,
  FamilyMembersResponse,
} from "../schemas/family.js";
import type { SuccessResponse } from "../schemas/common.js";

export class FamilyResource extends ResourceClient {
  /**
   * Get the current family group.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  group() {
    return this.get<FamilyGroupResponse>("/family");
  }

  /**
   * Create a new family group.
   * @throws {import("../errors.js").ApiError} `userAlreadyInFamilyGroup`, `unauthenticated`
   */
  create(name: string) {
    return this.post<SuccessResponse & { group?: unknown }>("/family", { name });
  }

  /**
   * List pending invites for a family group.
   * @throws {import("../errors.js").ApiError} `accessDenied`, `unauthenticated`
   */
  invites(groupId: string) {
    return this.get<FamilyInvitesResponse>(`/family/${groupId}/invites`);
  }

  /**
   * List members of a family group.
   * @throws {import("../errors.js").ApiError} `accessDenied`, `unauthenticated`
   */
  members(groupId: string) {
    return this.get<FamilyMembersResponse>(`/family/${groupId}/members`);
  }

  /**
   * Invite a member to a family group.
   * @throws {import("../errors.js").ApiError} `pendingFamilyInviteExists`, `familyGroupIsFull`, `unauthenticated`
   */
  invite(groupId: string, email: string, role: string) {
    return this.post<SuccessResponse & { invite?: unknown }>(`/family/${groupId}/invites`, {
      email,
      role,
    });
  }

  /**
   * List balance requests for a family group.
   * @throws {import("../errors.js").ApiError} `accessDenied`, `unauthenticated`
   */
  balanceRequests(groupId: string, status?: string) {
    return this.get<FamilyBalanceRequestsResponse>(`/family/${groupId}/balance-requests`, {
      status,
    });
  }

  /**
   * Remove a member from a family group.
   * @throws {import("../errors.js").ApiError} `cannotRemoveFamilyGroupOwner`, `onlyParentsCanRemoveMembers`, `unauthenticated`
   */
  removeMember(groupId: string, userId: string) {
    return this.del<SuccessResponse>(`/family/${groupId}/members/${encodeURIComponent(userId)}`);
  }

  /**
   * Update a family member's role or billing mode.
   * @throws {import("../errors.js").ApiError} `cannotAssignMinorRoleToAdult`, `unauthenticated`
   */
  updateMember(groupId: string, userId: string, body: { role?: string; familyBillingMode?: string | null }) {
    return this.patch<SuccessResponse>(`/family/${groupId}/members/${encodeURIComponent(userId)}`, body);
  }

  // <generated-openapi>
  /**
   * @generated DELETE /family/[groupId]
   */
  remove(groupId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}`, query, body);
  }

  /**
   * @generated GET /family/[groupId]
   */
  find(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}`, query);
  }

  /**
   * @generated PATCH /family/[groupId]
   */
  update(groupId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}`, body);
  }

  /**
   * @generated GET /family/[groupId]/audit
   */
  audit(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/audit`, query);
  }

  /**
   * @generated GET /family/[groupId]/auto-topup
   */
  autoTopup(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/auto-topup`, query);
  }

  /**
   * @generated POST /family/[groupId]/auto-topup
   */
  postAutoTopup(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/auto-topup`, body);
  }

  /**
   * @generated POST /family/[groupId]/balance-requests
   */
  postBalanceRequests(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/balance-requests`, body);
  }

  /**
   * @generated PATCH /family/[groupId]/balance-requests/[requestId]
   */
  updateBalanceRequests(groupId: string, requestId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/balance-requests/${encodeURIComponent(requestId)}`, body);
  }

  /**
   * @generated GET /family/[groupId]/billing
   */
  billing(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/billing`, query);
  }

  /**
   * @generated PATCH /family/[groupId]/billing
   */
  updateBilling(groupId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/billing`, body);
  }

  /**
   * @generated POST /family/[groupId]/billing
   */
  postBilling(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/billing`, body);
  }

  /**
   * @generated GET /family/[groupId]/billing/mandates
   */
  billingMandates(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/billing/mandates`, query);
  }

  /**
   * @generated PATCH /family/[groupId]/billing/mandates
   */
  updateBillingMandates(groupId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/billing/mandates`, body);
  }

  /**
   * @generated POST /family/[groupId]/billing/mandates
   */
  postBillingMandates(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/billing/mandates`, body);
  }

  /**
   * @generated DELETE /family/[groupId]/billing/mandates/[mandateId]
   */
  deleteBillingMandates(groupId: string, mandateId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/billing/mandates/${encodeURIComponent(mandateId)}`, query, body);
  }

  /**
   * @generated GET /family/[groupId]/consent
   */
  consent(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/consent`, query);
  }

  /**
   * @generated PATCH /family/[groupId]/consent
   */
  updateConsent(groupId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/consent`, body);
  }

  /**
   * @generated POST /family/[groupId]/consent
   */
  postConsent(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/consent`, body);
  }

  /**
   * @generated GET /family/[groupId]/controls/locks
   */
  controlsLocks(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/locks`, query);
  }

  /**
   * @generated POST /family/[groupId]/controls/locks
   */
  postControlsLocks(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/locks`, body);
  }

  /**
   * @generated DELETE /family/[groupId]/controls/locks/[lockId]
   */
  deleteControlsLocks(groupId: string, lockId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/locks/${encodeURIComponent(lockId)}`, query, body);
  }

  /**
   * @generated GET /family/[groupId]/controls/resource-limits
   */
  controlsResourceLimits(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/resource-limits`, query);
  }

  /**
   * @generated POST /family/[groupId]/controls/resource-limits
   */
  postControlsResourceLimits(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/resource-limits`, body);
  }

  /**
   * @generated DELETE /family/[groupId]/controls/resource-limits/[limitId]
   */
  deleteControlsResourceLimits(groupId: string, limitId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/resource-limits/${encodeURIComponent(limitId)}`, query, body);
  }

  /**
   * @generated PATCH /family/[groupId]/controls/resource-limits/[limitId]
   */
  updateControlsResourceLimits(groupId: string, limitId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/resource-limits/${encodeURIComponent(limitId)}`, body);
  }

  /**
   * @generated GET /family/[groupId]/controls/time-policies
   */
  controlsTimePolicies(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/time-policies`, query);
  }

  /**
   * @generated POST /family/[groupId]/controls/time-policies
   */
  postControlsTimePolicies(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/time-policies`, body);
  }

  /**
   * @generated DELETE /family/[groupId]/controls/time-policies/[policyId]
   */
  deleteControlsTimePolicies(groupId: string, policyId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/time-policies/${encodeURIComponent(policyId)}`, query, body);
  }

  /**
   * @generated PATCH /family/[groupId]/controls/time-policies/[policyId]
   */
  updateControlsTimePolicies(groupId: string, policyId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/controls/time-policies/${encodeURIComponent(policyId)}`, body);
  }

  /**
   * @generated DELETE /family/[groupId]/gdpr
   */
  deleteGdpr(groupId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/gdpr`, query, body);
  }

  /**
   * @generated GET /family/[groupId]/gdpr
   */
  gdpr(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/gdpr`, query);
  }

  /**
   * @generated POST /family/[groupId]/gdpr
   */
  postGdpr(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/gdpr`, body);
  }

  /**
   * @generated POST /family/[groupId]/members
   */
  postMembers(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/members`, body);
  }

  /**
   * @generated GET /family/[groupId]/messages
   */
  messages(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/messages`, query);
  }

  /**
   * @generated POST /family/[groupId]/messages
   */
  postMessages(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/messages`, body);
  }

  /**
   * @generated PATCH /family/[groupId]/messages/[messageId]
   */
  updateMessages(groupId: string, messageId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/messages/${encodeURIComponent(messageId)}`, body);
  }

  /**
   * @generated GET /family/[groupId]/monitoring
   */
  monitoring(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/monitoring`, query);
  }

  /**
   * @generated GET /family/[groupId]/payment-approvals
   */
  paymentApprovals(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/payment-approvals`, query);
  }

  /**
   * @generated PATCH /family/[groupId]/payment-approvals/[approvalId]
   */
  updatePaymentApprovals(groupId: string, approvalId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/payment-approvals/${encodeURIComponent(approvalId)}`, body);
  }

  /**
   * @generated GET /family/[groupId]/spending-limits
   */
  spendingLimits(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/spending-limits`, query);
  }

  /**
   * @generated POST /family/[groupId]/spending-limits
   */
  postSpendingLimits(groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/spending-limits`, body);
  }

  /**
   * @generated DELETE /family/[groupId]/spending-limits/[limitId]
   */
  deleteSpendingLimits(groupId: string, limitId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/spending-limits/${encodeURIComponent(limitId)}`, query, body);
  }

  /**
   * @generated PATCH /family/[groupId]/spending-limits/[limitId]
   */
  updateSpendingLimits(groupId: string, limitId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/spending-limits/${encodeURIComponent(limitId)}`, body);
  }

  /**
   * @generated GET /family/[groupId]/usage
   */
  usage(groupId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/${encodeURIComponent(groupId)}/usage`, query);
  }

  /**
   * @generated GET /family/invite/[token]
   */
  getInvite(token: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/family/invite/${encodeURIComponent(token)}`, query);
  }

  /**
   * @generated POST /family/invite/[token]
   */
  postInvite(token: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/family/invite/${encodeURIComponent(token)}`, body);
  }
  // </generated-openapi>
}
