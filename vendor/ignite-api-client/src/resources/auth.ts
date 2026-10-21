import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type {
  LoginResponse,
  MeResponse,
  SessionsResponse,
  TwoFactorEnableResponse,
  TwoFactorSetupResponse,
} from "../schemas/auth.js";
import type { SuccessResponse } from "../schemas/common.js";

export class AuthResource extends ResourceClient {
  /**
   * Authenticate with email and password.
   * @throws {import("../errors.js").ApiError} `invalidEmailOrPassword`, `authenticationFailed`, `invalidVerificationCode`
   */
  login(data: { email: string; password: string; twoFactorCode?: string; rememberMe: boolean }) {
    return this.post<LoginResponse>("/auth/login", data);
  }

  /**
   * Get the current authenticated user.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  me() {
    return this.get<MeResponse>("/auth/me");
  }

  /**
   * Update profile fields.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `invalidRequest`
   */
  updateProfile(data: { firstName?: string; lastName?: string; nickname?: string }) {
    return this.put<SuccessResponse>("/auth/me", data);
  }

  /**
   * End the current session.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  logout() {
    return this.post<SuccessResponse>("/auth/logout");
  }

  /**
   * End all sessions for the account.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  logoutAll() {
    return this.del<SuccessResponse>("/auth/logout");
  }

  /**
   * Change account password.
   * @throws {import("../errors.js").ApiError} `currentPasswordIsIncorrect`, `invalidPassword`, `unauthenticated`
   */
  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.post<SuccessResponse>("/auth/change-password", data);
  }

  /**
   * List active sessions.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `failedToGetSessions`
   */
  sessions() {
    return this.get<SessionsResponse>("/auth/sessions");
  }

  /**
   * Revoke a specific session.
   * @throws {import("../errors.js").ApiError} `cannotRevokeCurrentSessionUseLogoutInstead`, `unauthenticated`
   */
  revokeSession(id: string) {
    return this.del<SuccessResponse>("/auth/sessions", { id });
  }

  /**
   * Begin two-factor authentication setup.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  setup2fa() {
    return this.get<TwoFactorSetupResponse>("/auth/2fa/setup");
  }

  /**
   * Confirm and enable two-factor authentication.
   * @throws {import("../errors.js").ApiError} `invalidVerificationCode`, `unauthenticated`
   */
  enable2fa(code: string) {
    return this.post<TwoFactorEnableResponse>("/auth/2fa/setup", { code });
  }

  /**
   * Disable two-factor authentication.
   * @throws {import("../errors.js").ApiError} `incorrectPassword`, `invalidVerificationCode`, `unauthenticated`
   */
  disable2fa(code: string, password: string) {
    return this.del<SuccessResponse & { twoFactorStillEnabled?: boolean }>(
      "/auth/2fa/setup",
      undefined,
      { code, password },
    );
  }

  // <generated-openapi>
  /**
   * @generated GET /auth/backup-codes
   */
  backupCodes(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/backup-codes`, query);
  }

  /**
   * @generated POST /auth/backup-codes
   */
  postBackupCodes(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/backup-codes`, body);
  }

  /**
   * @generated POST /auth/blocklist-appeal
   */
  blocklistAppeal(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/blocklist-appeal`, body);
  }

  /**
   * @generated POST /auth/code
   */
  code(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/code`, body);
  }

  /**
   * @generated POST /auth/forgot-password
   */
  forgotPassword(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/forgot-password`, body);
  }

  /**
   * @generated POST /auth/login/begin
   */
  loginBegin(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/login/begin`, body);
  }

  /**
   * @generated PATCH /auth/me
   */
  updateMe(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/auth/me`, body);
  }

  /**
   * @generated GET /auth/oauth/[provider]
   */
  oauth(provider: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/oauth/${encodeURIComponent(provider)}`, query);
  }

  /**
   * @generated GET /auth/oauth/[provider]/callback
   */
  oauthCallback(provider: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/oauth/${encodeURIComponent(provider)}/callback`, query);
  }

  /**
   * @generated POST /auth/oauth/2fa-complete
   */
  oauthTwoFaComplete(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/oauth/2fa-complete`, body);
  }

  /**
   * @generated DELETE /auth/oauth/link/[provider]
   */
  deleteOauthLink(provider: string, query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/auth/oauth/link/${encodeURIComponent(provider)}`, query, body);
  }

  /**
   * @generated GET /auth/oauth/link/[provider]
   */
  oauthLink(provider: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/oauth/link/${encodeURIComponent(provider)}`, query);
  }

  /**
   * @generated GET /auth/oauth/providers
   */
  oauthProviders(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/oauth/providers`, query);
  }

  /**
   * @generated DELETE /auth/passkeys
   */
  deletePasskeys(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/auth/passkeys`, query, body);
  }

  /**
   * @generated GET /auth/passkeys
   */
  passkeys(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/passkeys`, query);
  }

  /**
   * @generated POST /auth/passkeys/authenticate
   */
  passkeysAuthenticate(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/passkeys/authenticate`, body);
  }

  /**
   * @generated GET /auth/passkeys/register
   */
  passkeysRegister(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/passkeys/register`, query);
  }

  /**
   * @generated POST /auth/passkeys/register
   */
  postPasskeysRegister(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/passkeys/register`, body);
  }

  /**
   * @generated POST /auth/register
   */
  register(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/register`, body);
  }

  /**
   * @generated GET /auth/reset-password
   */
  resetPassword(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/reset-password`, query);
  }

  /**
   * @generated POST /auth/reset-password
   */
  postResetPassword(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/reset-password`, body);
  }

  /**
   * @generated GET /auth/session
   */
  session(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/session`, query);
  }

  /**
   * @generated GET /auth/sso/callback
   */
  ssoCallback(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/sso/callback`, query);
  }

  /**
   * @generated POST /auth/sso/link
   */
  ssoLink(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/sso/link`, body);
  }

  /**
   * @generated GET /auth/sso/start
   */
  ssoStart(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/sso/start`, query);
  }

  /**
   * @generated POST /auth/verify-account
   */
  verifyAccount(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/verify-account`, body);
  }

  /**
   * @generated POST /auth/verify-account/resend
   */
  verifyAccountResend(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/verify-account/resend`, body);
  }

  /**
   * @generated POST /auth/verify-code
   */
  verifyCode(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/verify-code`, body);
  }

  /**
   * @generated GET /auth/verify-email
   */
  verifyEmail(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/auth/verify-email`, query);
  }

  /**
   * @generated POST /auth/verify-email
   */
  postVerifyEmail(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/auth/verify-email`, body);
  }
  // </generated-openapi>
}
