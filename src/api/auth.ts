import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class AuthResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  login(data: { email: string; password: string; twoFactorCode?: string; rememberMe: boolean }) {
    return this.client.auth.login(data) as Promise<{
      success: boolean;
      token?: string;
      user?: unknown;
      error?: string;
      requiresTwoFactor?: boolean;
    }>;
  }

  me() {
    return this.client.auth.me() as Promise<{ success: boolean; user: unknown & { twoFactorEnabled?: boolean } }>;
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    phone?: string;
    locale?: string;
    companyName?: string;
    vatNumber?: string;
    acknowledgeNameChangeReverification?: boolean;
  }) {
    return this.client.auth.updateProfile(data) as Promise<{ success: boolean; error?: string; user?: unknown }>;
  }

  logout() {
    return this.client.auth.logout();
  }

  logoutAll() {
    return this.client.auth.logoutAll();
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.client.auth.changePassword(data) as Promise<{ success: boolean; error?: string }>;
  }

  sessions() {
    return this.client.auth.sessions();
  }

  revokeSession(id: string) {
    return this.client.auth.revokeSession(id);
  }

  setup2fa() {
    return this.client.auth.setup2fa() as Promise<{
      success: boolean;
      secret: string;
      otpauthUrl: string;
      qrCode?: string;
      error?: string;
    }>;
  }

  enable2fa(code: string) {
    return this.client.auth.enable2fa(code) as Promise<{ success: boolean; backupCodes?: string[]; error?: string }>;
  }

  disable2fa(code: string, password: string) {
    return this.client.auth.disable2fa(code, password) as Promise<{
      success: boolean;
      error?: string;
      twoFactorStillEnabled?: boolean;
    }>;
  }

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    locale: string;
    vatNumber?: string;
    accountType: string;
    country: string;
    street: string;
    city: string;
    zip: string;
    companyName?: string;
    newsletterOptIn?: boolean;
  }) {
    return this.client.auth.register(data) as Promise<{
      success: boolean;
      token?: string;
      user?: unknown;
      error?: string;
      requiresVerification?: boolean;
      devActivationCode?: string;
    }>;
  }

  verifyAccount(code: string) {
    return this.client.auth.verifyAccount({ code }) as Promise<{
      success: boolean;
      error?: string;
      errorCode?: string;
    }>;
  }

  resendActivationCode() {
    return this.client.auth.verifyAccountResend() as Promise<{
      success: boolean;
      error?: string;
      errorCode?: string;
      devActivationCode?: string;
    }>;
  }
}
