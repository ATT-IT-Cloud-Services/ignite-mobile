# ignite API Error Codes

Machine-readable error codes returned by the ignite API in the `errorCode` field.
Map these codes to localized messages in your application — this client does not provide user-facing text.

See `ApiErrorCodes` in the package for the complete registry.

## Authentication & sessions

| Code | Description |
|------|-------------|
| `unauthenticated` | Request lacks a valid session or API key |
| `invalidEmailOrPassword` | Login credentials are incorrect |
| `authenticationFailed` | Authentication could not be completed |
| `invalidVerificationCode` | Two-factor or verification code is invalid |
| `invalidOrExpiredCode` | Verification code has expired or is invalid |
| `currentPasswordIsIncorrect` | Current password does not match |
| `invalidPassword` | Password does not meet requirements |
| `cannotRevokeCurrentSessionUseLogoutInstead` | Use logout for the active session |
| `invalidApiKey` | API key is invalid or revoked |
| `apiKeyNotFound` | API key ID not found |
| `apiKeyRevoked` | API key has been revoked |
| `apiKeyMissingPermission` | API key lacks required permission |

## Authorization

| Code | Description |
|------|-------------|
| `accessDenied` | Caller lacks permission for this resource |
| `adminAccessRequired` | Admin role required |
| `clientPlatformNotAllowed` | Action not permitted from this client platform |
| `serviceNotOwned` | Service does not belong to the caller |
| `serviceNotFound` | Service ID not found |

## Billing & invoices

| Code | Description |
|------|-------------|
| `invoiceNotFound` | Invoice ID not found |
| `insufficientBalance` | Account balance too low |
| `invalidPaymentMethod` | Payment method is not valid for this action |
| `invalidAmount` | Amount is out of allowed range |
| `billingAddressNotFound` | Billing address not found |

## Checkout & cart

| Code | Description |
|------|-------------|
| `cartEmpty` | Cart has no items |
| `catalogStockExhausted` | Product is out of stock |
| `checkoutValidationFailed` | Cart validation failed |
| `checkoutFailed` | Checkout could not be completed |
| `checkoutAlreadyInProgress` | Another checkout is in progress |
| `calculationFailed` | Price calculation failed |
| `couponOneOnly` | Only one coupon allowed |

## Wallet & vouchers

| Code | Description |
|------|-------------|
| `codeHasExpired` | Voucher code has expired |
| `codeHasAlreadyBeenUsed` | Voucher code was already redeemed |
| `amountOutOfRange` | Top-up amount outside allowed range |
| `anAutoTopUpForThisDayAlreadyExists` | Auto top-up already scheduled for this day |

## Family accounts

| Code | Description |
|------|-------------|
| `familyBudgetExhausted` | Family spending limit reached |
| `familyAccountLocked` | Family account is locked |
| `familyConsentRequired` | Parental consent required |
| `familyGroupIsFull` | Family group member limit reached |
| `userAlreadyInFamilyGroup` | User is already in a family group |
| `pendingFamilyInviteExists` | A pending invite already exists |

## Domains

| Code | Description |
|------|-------------|
| `domainCurrentlyUnavailable` | Domain is not available for registration |
| `domainTransferAuthCodeRequired` | Auth code required for transfer |
| `domainOrderNotFound` | Domain order not found |

## BYOIP & floating IPs

| Code | Description |
|------|-------------|
| `byoipNetworkNotOwned` | BYOIP network does not belong to caller |
| `byoipInvalidAssignedPrefix` | Assigned prefix is invalid |
| `byoipAssignmentNotFound` | Assignment not found |

## Affiliates

| Code | Description |
|------|-------------|
| `affiliateNotFound` | User is not an affiliate |
| `aPendingPayoutRequestAlreadyExists` | Payout request already pending |
| `amountExceedsWithdrawableBalance` | Payout amount exceeds balance |

## General

| Code | Description |
|------|-------------|
| `invalidRequest` | Request body or parameters are invalid |
| `invalidJsonBody` | Request body is not valid JSON |
| `internalError` | Unexpected server error |
| `apiErrorUnknown` | Unknown error (fallback) |

## Handling errors

```ts
import { IgniteClient, ApiError } from "@ignite/api-client";

try {
  await client.billing.payInvoice(id, { paymentMethod: "guthaben" });
} catch (err) {
  if (err instanceof ApiError) {
    // err.code — machine-readable, e.g. "insufficientBalance"
    // err.status — HTTP semantic status
    // err.payload — raw API response body
  }
}
```

Regenerate the full code list from the ignite server: `packages/server/src/api/error-codes.generated.ts`.
