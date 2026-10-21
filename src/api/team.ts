import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

/** Thin adapter over the generated `client.team` resource. */
export class TeamResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list() {
    return this.client.team.list() as unknown as Promise<{ success: boolean; teams?: Array<Record<string, unknown>> }>;
  }

  members(teamId: string) {
    return this.client.team.members(teamId) as unknown as Promise<{ success: boolean; members?: Array<Record<string, unknown>> }>;
  }

  invites(teamId: string) {
    return this.client.team.invites(teamId) as unknown as Promise<{ success: boolean; invites?: Array<Record<string, unknown>> }>;
  }

  createInvite(teamId: string, body: Record<string, unknown>) {
    return this.client.team.postInvites(teamId, body) as unknown as Promise<{ success: boolean; errorCode?: string }>;
  }

  removeInvite(teamId: string, inviteId: string) {
    return this.client.team.deleteInvites(teamId, inviteId) as unknown as Promise<{ success: boolean }>;
  }

  inviteInfo(token: string) {
    return this.client.team.invite(token) as unknown as Promise<{ success: boolean; invite?: Record<string, unknown> }>;
  }

  acceptInvite(token: string) {
    return this.client.team.postInvite(token, {}) as unknown as Promise<{ success: boolean; errorCode?: string }>;
  }
}
