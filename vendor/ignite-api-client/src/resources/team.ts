import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";

/** Generated from apps/backend/app/openapi.generated.json. */
export class TeamResource extends ResourceClient {
  /**
   * @generated GET /team
   */
  list(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team`, query);
  }

  /**
   * @generated POST /team
   */
  create(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team`, body);
  }

  /**
   * @generated DELETE /team/[teamId]
   */
  remove(teamId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}`, query, body);
  }

  /**
   * @generated GET /team/[teamId]
   */
  find(teamId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}`, query);
  }

  /**
   * @generated PATCH /team/[teamId]
   */
  update(teamId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}`, body);
  }

  /**
   * @generated GET /team/[teamId]/audit
   */
  audit(teamId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/audit`, query);
  }

  /**
   * @generated GET /team/[teamId]/groups
   */
  groups(teamId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/groups`, query);
  }

  /**
   * @generated POST /team/[teamId]/groups
   */
  postGroups(teamId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/groups`, body);
  }

  /**
   * @generated DELETE /team/[teamId]/groups/[groupId]
   */
  deleteGroups(teamId: string, groupId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/groups/${encodeURIComponent(groupId)}`, query, body);
  }

  /**
   * @generated PATCH /team/[teamId]/groups/[groupId]
   */
  updateGroups(teamId: string, groupId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/groups/${encodeURIComponent(groupId)}`, body);
  }

  /**
   * @generated DELETE /team/[teamId]/groups/[groupId]/members
   */
  deleteGroupsMembers(teamId: string, groupId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/groups/${encodeURIComponent(groupId)}/members`, query, body);
  }

  /**
   * @generated POST /team/[teamId]/groups/[groupId]/members
   */
  groupsMembers(teamId: string, groupId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/groups/${encodeURIComponent(groupId)}/members`, body);
  }

  /**
   * @generated GET /team/[teamId]/invites
   */
  invites(teamId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/invites`, query);
  }

  /**
   * @generated POST /team/[teamId]/invites
   */
  postInvites(teamId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/invites`, body);
  }

  /**
   * @generated DELETE /team/[teamId]/invites/[inviteId]
   */
  deleteInvites(teamId: string, inviteId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/invites/${encodeURIComponent(inviteId)}`, query, body);
  }

  /**
   * @generated GET /team/[teamId]/members
   */
  members(teamId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/members`, query);
  }

  /**
   * @generated DELETE /team/[teamId]/members/[userId]
   */
  deleteMembers(teamId: string, userId: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/members/${encodeURIComponent(userId)}`, query, body);
  }

  /**
   * @generated PATCH /team/[teamId]/members/[userId]
   */
  updateMembers(teamId: string, userId: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/members/${encodeURIComponent(userId)}`, body);
  }

  /**
   * @generated POST /team/[teamId]/ownership-transfer
   */
  ownershipTransfer(teamId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/ownership-transfer`, body);
  }

  /**
   * @generated GET /team/[teamId]/payment-methods
   */
  paymentMethods(teamId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/payment-methods`, query);
  }

  /**
   * @generated POST /team/[teamId]/payment-methods
   */
  postPaymentMethods(teamId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/payment-methods`, body);
  }

  /**
   * @generated GET /team/[teamId]/projects
   */
  projects(teamId: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/projects`, query);
  }

  /**
   * @generated POST /team/[teamId]/projects
   */
  postProjects(teamId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/projects`, body);
  }

  /**
   * @generated POST /team/[teamId]/projects/[projectId]
   */
  postProjectsTeamIdprojectId(teamId: string, projectId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/projects/${encodeURIComponent(projectId)}`, body);
  }

  /**
   * @generated POST /team/[teamId]/subscriptions/[subscriptionId]/cancel
   */
  subscriptionsCancel(teamId: string, subscriptionId: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/${encodeURIComponent(teamId)}/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, body);
  }

  /**
   * @generated GET /team/invite/[token]
   */
  invite(token: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/team/invite/${encodeURIComponent(token)}`, query);
  }

  /**
   * @generated POST /team/invite/[token]
   */
  postInvite(token: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/team/invite/${encodeURIComponent(token)}`, body);
  }
}
