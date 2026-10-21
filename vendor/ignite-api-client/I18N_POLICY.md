# Internationalization Policy — ignite API TypeScript Client

This client is a **machine-facing SDK**, not a UI layer. Human-readable text belongs in consuming applications (web panel, mobile app), not in this package.

## Runtime code (enforced)

- **MUST NOT** return German, English, or any other localized user messages from functions, thrown errors, or response wrappers.
- **MUST** surface API failures as:
  - `errorCode` strings (camelCase, matching `packages/server/src/api/error-codes.ts` on the server)
  - optional `errorParams` for interpolation in the consumer's i18n layer
  - HTTP status codes and structured response bodies unchanged from the API
- **MUST NOT** hardcode UI strings, toast text, labels, or fallback sentences in `.ts` source files under `src/`.
- Boolean flags, numbers, enums, and opaque identifiers are allowed in return values.

## Documentation (English only)

- `README.md` — setup, usage, examples (English)
- `ERROR_CODES.md` — catalog of `errorCode` values with English descriptions for integrators

## Consumer responsibility

Applications that show errors to end users **must** map `errorCode` → localized message (see `resolveApiError` in the ignite codebase). This client only transports codes.

## Review checklist before merge

- [ ] No `"…"` string literals that read like user-facing sentences in `src/**/*.ts`
- [ ] Thrown errors use `errorCode` (or re-export API payload), not localized `message` fields invented by the client
- [ ] README and ERROR_CODES are English
- [ ] Tests assert on `errorCode`, not on German/English message text
