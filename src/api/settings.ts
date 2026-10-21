import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export type UserAddress = {
  id: string;
  label?: string | null;
  isDefault?: boolean;
  companyName?: string | null;
  vatId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  street: string;
  zip: string;
  city: string;
  countryCode?: string | null;
  country: string;
  phone?: string | null;
};

export type UserSettingsPatch = {
  loginNotificationEmailOptIn?: boolean;
  emailNotifications?: boolean;
  notificationSoundEnabled?: boolean;
  servicePowerActionEmailOptIn?: boolean;
};

export class SettingsResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  addresses() {
    return this.client.addresses.list() as Promise<{ success: boolean; addresses: UserAddress[] }>;
  }

  createAddress(body: Record<string, unknown>) {
    return this.client.addresses.create(body) as Promise<{ success: boolean; address?: UserAddress }>;
  }

  updateAddress(body: Record<string, unknown>) {
    return this.client.addresses.replace(body) as Promise<{ success: boolean; address?: UserAddress }>;
  }

  deleteAddress(id: string) {
    return this.client.addresses.remove({ id }) as Promise<{ success: boolean }>;
  }

  countries() {
    return this.client.shop.countries() as Promise<{
      success: boolean;
      countries?: Array<{ countryCode: string; countryName: string; isDefault?: boolean }>;
    }>;
  }

  patchUserSettings(body: UserSettingsPatch) {
    return this.client.user.updateSettings(body) as Promise<{ success: boolean; user?: Record<string, unknown> }>;
  }

  newsletterSubscribe() {
    return this.client.user.postNewsletterSettings({ subscribe: true }) as Promise<{ success: boolean }>;
  }

  discordState() {
    return this.client.user.discord() as Promise<{
      success: boolean;
      linked?: boolean;
      discord?: { discordUserId: string } | null;
      allowThirdPartySupport?: boolean;
      supportConsent?: boolean;
      publicRoleConsent?: boolean;
    }>;
  }

  linkDiscord(token: string) {
    return this.client.user.postDiscord({ token }) as Promise<{ success: boolean }>;
  }

  unlinkDiscord() {
    return this.client.user.deleteDiscord() as Promise<{ success: boolean }>;
  }

  patchDiscord(body: Record<string, unknown>) {
    return this.client.user.updateDiscord(body) as Promise<{ success: boolean }>;
  }

  ssoState() {
    return this.client.user.sso() as Promise<{
      success: boolean;
      eligible?: boolean;
      isBusiness?: boolean;
      accountLinks?: Array<{ id: string; domain: string; displayName: string | null; externalEmail: string | null }>;
      assignedProviders?: Array<{ id: string; domain: string; displayName: string | null; verified: boolean }>;
    }>;
  }

  dpaOverview() {
    return this.client.user.dpa() as Promise<{
      success: boolean;
      active?: boolean;
      documents?: Array<{ id: string; fileName: string; status: string; createdAt: string; retainUntil?: string | null }>;
    }>;
  }

  idVerificationEnforcement() {
    return this.client.user.idVerificationEnforcementStatus() as Promise<{
      success: boolean;
      required?: boolean;
      status?: string | null;
    }>;
  }
}
