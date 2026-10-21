import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class FamilyResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  group() {
    return this.client.family.group();
  }

  create(name: string) {
    return this.client.family.create(name);
  }

  invites(groupId: string) {
    return this.client.family.invites(groupId);
  }

  members(groupId: string) {
    return this.client.family.members(groupId);
  }

  invite(groupId: string, email: string, role: string) {
    return this.client.family.invite(groupId, email, role);
  }

  getInvite(token: string) {
    return this.client.family.getInvite(token);
  }

  respondToInvite(token: string, action: "accept" | "decline") {
    return this.client.family.postInvite(token, { action });
  }

  balanceRequests(groupId: string, status?: string) {
    return this.client.family.balanceRequests(groupId, status);
  }

  removeMember(groupId: string, userId: string) {
    return this.client.family.removeMember(groupId, userId);
  }

  updateMember(groupId: string, userId: string, body: { role?: string; familyBillingMode?: string | null }) {
    return this.client.family.updateMember(groupId, userId, body);
  }
}
