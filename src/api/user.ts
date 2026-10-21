import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type SupportPinState = {
  supportPin: string | null;
  pinExpiresAt: string | null;
  pinTimeLeft: number | null;
  pinCooldown: number | null;
};

type SupportPinApiResponse = {
  success?: boolean;
  pin?: string | null;
  expiresAt?: string | null;
};

function mapSupportPinResponse(data: SupportPinApiResponse): SupportPinState {
  const pinExpiresAt = typeof data.expiresAt === "string" ? data.expiresAt : null;
  const pinTimeLeft = pinExpiresAt
    ? Math.max(0, Math.floor((new Date(pinExpiresAt).getTime() - Date.now()) / 1000))
    : null;

  return {
    supportPin: typeof data.pin === "string" ? data.pin : null,
    pinExpiresAt,
    pinTimeLeft: pinTimeLeft && pinTimeLeft > 0 ? pinTimeLeft : null,
    pinCooldown: null,
  };
}

export class UserResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  auditLog(limit = 50) {
    return this.client.user.auditLog(limit) as Promise<{ success: boolean; logs: unknown[] }>;
  }

  gdprExportCheck() {
    return this.client.user.gdprExportCheck() as Promise<{ success: boolean; warnings?: string[] }>;
  }

  gdprExportConfirm(password: string) {
    return this.client.user.gdprExportConfirm(password) as Promise<{ success: boolean }>;
  }

  apiKeys(page = 1, pageSize = 50) {
    return this.client.user.apiKeys(page, pageSize) as Promise<{
      success: boolean;
      apiKeys: unknown[];
      total?: number;
    }>;
  }

  createApiKey(name: string) {
    return this.client.user.createApiKey(name) as Promise<{
      success: boolean;
      apiKey: unknown;
      secret: string;
    }>;
  }

  revokeApiKey(id: string) {
    return this.client.user.revokeApiKey(id) as Promise<{ success: boolean }>;
  }

  supportPin() {
    return this.client.user.supportPin().then((data) => mapSupportPinResponse(data as unknown as SupportPinApiResponse));
  }

  generateSupportPin() {
    return this.client.user
      .generateSupportPin()
      .then((data) => mapSupportPinResponse(data as unknown as SupportPinApiResponse));
  }

  registerDeviceToken(body: {
    deviceToken: string;
    platform?: string;
    channel?: "MOBILE_NATIVE" | "ELECTRON";
  }) {
    return this.client.user.pushDeviceToken(body) as Promise<{ success: boolean }>;
  }

  disableDeviceToken(deviceToken: string) {
    return this.client.user.deletePushDeviceToken(undefined, { deviceToken }) as Promise<{ success: boolean }>;
  }

  pushPublicKey() {
    return this.client.user.pushPublicKey() as Promise<{ success: boolean; publicKey: string | null }>;
  }

  subscribeWebPush(body: {
    platform?: string;
    subscription: {
      endpoint?: string;
      keys?: { auth?: string; p256dh?: string };
    };
  }) {
    return this.client.user.pushSubscribe(body) as Promise<{ success: boolean }>;
  }

  unsubscribeWebPush(endpoint: string) {
    return this.client.user.deletePushSubscribe(undefined, { endpoint }) as Promise<{ success: boolean }>;
  }

  setDateOfBirth(dateOfBirth: string) {
    return this.client.user.dateOfBirth({ dateOfBirth }) as Promise<{ success: boolean; error?: string }>;
  }
}
