import { ResourceClient } from "../resource-client.js";
import type { QueryParams } from "../types.js";
import type { ApiKey, AuditLogEntry, SupportPinResponse } from "../schemas/user.js";
import type { SuccessResponse } from "../schemas/common.js";

export class UserResource extends ResourceClient {
  /**
   * List audit log entries.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  auditLog(limit = 50) {
    return this.get<SuccessResponse & { logs: AuditLogEntry[] }>("/user/audit-log", { limit });
  }

  /**
   * Check GDPR export warnings (dry run).
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  gdprExportCheck() {
    return this.del<SuccessResponse & { warnings?: string[] }>("/user/gdpr-export");
  }

  /**
   * Confirm GDPR data export.
   * @throws {import("../errors.js").ApiError} `incorrectPassword`, `unauthenticated`
   */
  gdprExportConfirm(password: string) {
    return this.del<SuccessResponse>("/user/gdpr-export", { confirm: "true" }, { password });
  }

  /**
   * List API keys.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  apiKeys(page = 1, pageSize = 50) {
    return this.get<SuccessResponse & { apiKeys: ApiKey[]; total?: number }>("/api-keys", {
      page,
      pageSize,
    });
  }

  /**
   * Create a new API key.
   * @throws {import("../errors.js").ApiError} `unauthenticated`, `invalidRequest`
   */
  createApiKey(name: string) {
    return this.post<SuccessResponse & { apiKey: ApiKey; secret: string }>("/api-keys", { name });
  }

  /**
   * Revoke an API key.
   * @throws {import("../errors.js").ApiError} `apiKeyNotFound`, `unauthenticated`
   */
  revokeApiKey(id: string) {
    return this.del<SuccessResponse>("/api-keys", { id });
  }

  /**
   * Get current support PIN status.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  supportPin() {
    return this.get<SupportPinResponse>("/user/support-pin");
  }

  /**
   * Generate a new support PIN.
   * @throws {import("../errors.js").ApiError} `unauthenticated`
   */
  generateSupportPin() {
    return this.post<SupportPinResponse>("/user/support-pin");
  }

  // <generated-openapi>
  /**
   * @generated GET /api-keys/usage
   */
  usage(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/api-keys/usage`, query);
  }

  /**
   * @generated GET /user/autopay
   */
  autopay(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/autopay`, query);
  }

  /**
   * @generated PATCH /user/autopay
   */
  updateAutopay(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/user/autopay`, body);
  }

  /**
   * @generated GET /user/business-data-review
   */
  businessDataReview(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/business-data-review`, query);
  }

  /**
   * @generated POST /user/change-email
   */
  changeEmail(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/change-email`, body);
  }

  /**
   * @generated POST /user/change-email/verify-new
   */
  changeEmailVerifyNew(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/change-email/verify-new`, body);
  }

  /**
   * @generated POST /user/change-email/verify-old
   */
  changeEmailVerifyOld(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/change-email/verify-old`, body);
  }

  /**
   * @generated POST /user/date-of-birth
   */
  dateOfBirth(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/date-of-birth`, body);
  }

  /**
   * @generated DELETE /user/discord
   */
  deleteDiscord(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/user/discord`, query, body);
  }

  /**
   * @generated GET /user/discord
   */
  discord(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/discord`, query);
  }

  /**
   * @generated PATCH /user/discord
   */
  updateDiscord(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/user/discord`, body);
  }

  /**
   * @generated POST /user/discord
   */
  postDiscord(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/discord`, body);
  }

  /**
   * @generated GET /user/dpa
   */
  dpa(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/dpa`, query);
  }

  /**
   * @generated POST /user/dpa
   */
  postDpa(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/dpa`, body);
  }

  /**
   * @generated POST /user/dpa/cancel
   */
  dpaCancel(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/dpa/cancel`, body);
  }

  /**
   * @generated GET /user/dpa/documents/[id]
   */
  dpaDocuments(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/dpa/documents/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated GET /user/gdpr-export
   */
  gdprExport(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/gdpr-export`, query);
  }

  /**
   * @generated GET /user/gdpr-export/history
   */
  gdprExportHistory(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/gdpr-export/history`, query);
  }

  /**
   * @generated GET /user/gdpr-export/history/[id]
   */
  getGdprExportHistory(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/gdpr-export/history/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated POST /user/id-verification/[id]/decline
   */
  idVerificationDecline(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/${encodeURIComponent(id)}/decline`, body);
  }

  /**
   * @generated POST /user/id-verification/[id]/enjyn-restart
   */
  idVerificationEnjynRestart(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/${encodeURIComponent(id)}/enjyn-restart`, body);
  }

  /**
   * @generated POST /user/id-verification/[id]/enjyn-start
   */
  idVerificationEnjynStart(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/${encodeURIComponent(id)}/enjyn-start`, body);
  }

  /**
   * @generated POST /user/id-verification/[id]/method
   */
  idVerificationMethod(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/${encodeURIComponent(id)}/method`, body);
  }

  /**
   * @generated POST /user/id-verification/[id]/refuse
   */
  idVerificationRefuse(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/${encodeURIComponent(id)}/refuse`, body);
  }

  /**
   * @generated POST /user/id-verification/[id]/upload
   */
  idVerificationUpload(id: string, body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/${encodeURIComponent(id)}/upload`, body);
  }

  /**
   * @generated GET /user/id-verification/enforcement-status
   */
  idVerificationEnforcementStatus(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/id-verification/enforcement-status`, query);
  }

  /**
   * @generated POST /user/id-verification/enjyn-callback
   */
  idVerificationEnjynCallback(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/enjyn-callback`, body);
  }

  /**
   * @generated POST /user/id-verification/start
   */
  idVerificationStart(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/id-verification/start`, body);
  }

  /**
   * @generated GET /user/id-verification/status
   */
  idVerificationStatus(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/id-verification/status`, query);
  }

  /**
   * @generated GET /user/newsletter-settings
   */
  newsletterSettings(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/newsletter-settings`, query);
  }

  /**
   * @generated POST /user/newsletter-settings
   */
  postNewsletterSettings(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/newsletter-settings`, body);
  }

  /**
   * @generated GET /user/notifications
   */
  notifications(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/notifications`, query);
  }

  /**
   * @generated PATCH /user/notifications
   */
  updateNotifications(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/user/notifications`, body);
  }

  /**
   * @generated GET /user/notifications/[id]
   */
  getNotifications(id: string, query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/notifications/${encodeURIComponent(id)}`, query);
  }

  /**
   * @generated PATCH /user/notifications/[id]
   */
  patchUpdateNotifications(id: string, body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/user/notifications/${encodeURIComponent(id)}`, body);
  }

  /**
   * @generated GET /user/profile-review
   */
  profileReview(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/profile-review`, query);
  }

  /**
   * @generated POST /user/profile-review/confirm
   */
  profileReviewConfirm(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/profile-review/confirm`, body);
  }

  /**
   * @generated DELETE /user/push/device-token
   */
  deletePushDeviceToken(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/user/push/device-token`, query, body);
  }

  /**
   * @generated POST /user/push/device-token
   */
  pushDeviceToken(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/push/device-token`, body);
  }

  /**
   * @generated GET /user/push/preferences
   */
  pushPreferences(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/push/preferences`, query);
  }

  /**
   * @generated PATCH /user/push/preferences
   */
  updatePushPreferences(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/user/push/preferences`, body);
  }

  /**
   * @generated GET /user/push/public-key
   */
  pushPublicKey(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/push/public-key`, query);
  }

  /**
   * @generated DELETE /user/push/subscribe
   */
  deletePushSubscribe(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/user/push/subscribe`, query, body);
  }

  /**
   * @generated POST /user/push/subscribe
   */
  pushSubscribe(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/push/subscribe`, body);
  }

  /**
   * @generated PATCH /user/settings
   */
  updateSettings(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/user/settings`, body);
  }

  /**
   * @generated DELETE /user/sso
   */
  deleteSso(query?: QueryParams, body?: Record<string, unknown>) {
    return this.del<Record<string, unknown>>(`/user/sso`, query, body);
  }

  /**
   * @generated GET /user/sso
   */
  sso(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/sso`, query);
  }

  /**
   * @generated PATCH /user/sso
   */
  updateSso(body?: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/user/sso`, body);
  }

  /**
   * @generated POST /user/sso
   */
  postSso(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/sso`, body);
  }

  /**
   * @generated POST /user/subscriptions
   */
  subscriptions(body?: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/user/subscriptions`, body);
  }

  /**
   * @generated GET /user/support-phone
   */
  supportPhone(query?: QueryParams) {
    return this.get<Record<string, unknown>>(`/user/support-phone`, query);
  }
  // </generated-openapi>
}
