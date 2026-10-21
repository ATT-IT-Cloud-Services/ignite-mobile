# @ignite/api-client

Official ignite API client (TypeScript).

Machine-facing SDK — no localized error messages. API failures throw `ApiError` with a machine-readable `code`, HTTP `status`, and raw `payload`. Map `code` to your own i18n layer.

## Install

```bash
npm install @ignite/api-client
```

Standalone GitHub repository: [`api-client-typescript`](https://github.com/ATT-IT-Cloud-Services/api-client-typescript).

Requires Node.js 18+ (native `fetch`) or any environment with a `fetch` polyfill.

## Quick start

```ts
import { IgniteClient, ApiError } from "@ignite/api-client";

const client = new IgniteClient({
  baseUrl: "https://api.example.test",
  clientKind: "api",
});

// Login
const { token } = await client.auth.login({
  email: "you@example.com",
  password: "secret",
  rememberMe: true,
});
client.setToken(token!);

// List services
const { services } = await client.services.list();

// Error handling
try {
  await client.billing.payInvoice("inv_123", { paymentMethod: "guthaben" });
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.code);    // e.g. "insufficientBalance"
    console.log(err.status);  // e.g. 400
    console.log(err.payload); // raw API body
  }
}
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | required | ignite API base URL |
| `token` | `string \| null` | `null` | Bearer session token or API key |
| `clientKind` | `"desktop" \| "mobile" \| "api"` | `"api"` | Sent as `X-Ignite-Client` header |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch implementation |
| `headers` | `Record<string, string>` | `{}` | Extra headers on every request |
| `sandbox` | `boolean` | `false` | Enable sandbox mode (sends `x-sandbox: true`) |
| `sandboxError` | `string` | `undefined` | Force a sandbox error code (`x-sandbox-error`) |
| `sandboxStatus` | `number` | `undefined` | HTTP status for a forced sandbox error (`x-sandbox-status`, default 400) |

### Client kind

Some financially sensitive endpoints (checkout, invoice payment, business fund) require `clientKind: "desktop"`. The server rejects `mobile` clients for these actions.

### API keys

Create an API key via `client.user.createApiKey(name)`, then pass the secret as `token`:

```ts
const client = new IgniteClient({
  baseUrl: "https://api.example.test",
  token: process.env.IGNITE_API_KEY,
});
```

### Sandbox mode

For integration testing, enable `sandbox` to hit the API without a valid API key or session. The API returns randomly generated placeholder data and performs no real reads, writes, or provider calls. Force an error response with `sandboxError` (and optionally `sandboxStatus`) to exercise your error handling:

```ts
const client = new IgniteClient({
  baseUrl: "https://api.example.test",
  sandbox: true,
});

const failing = new IgniteClient({
  baseUrl: "https://api.example.test",
  sandbox: true,
  sandboxError: "rate_limited",
  sandboxStatus: 429,
});
```

Paths are host-root on `https://api.example.test` (e.g. `/services`). Legacy `/api/*` redirects with HTTP 308; this client does not use the prefix.

## Resources

Typed helpers remain on the original namespaces. Generated methods cover every public OpenAPI operation and return `Record<string, unknown>`.

| Namespace | Description |
|-----------|-------------|
| `auth` | Login, sessions, 2FA, OAuth, passkeys |
| `services` | VMs, containers, provider actions |
| `billing` | Invoices, subscriptions, payment methods |
| `checkout` | Cart validation, calculation, submit |
| `shop` | Product catalog |
| `dashboard` | Overview metrics |
| `domains` | Domain & DNS management |
| `subdomains` | Subdomain management |
| `ipManager` | IP assignment |
| `sshKeys` | SSH key management |
| `support` | Tickets, knowledge base, feedback |
| `user` | Audit log, API keys, GDPR export |
| `wallet` | Balance, vouchers, auto top-up |
| `business` | Business fund contracts |
| `affiliates` | Affiliate commissions & payouts |
| `family` | Family group management |
| `byoip` | Bring-your-own-IP |
| `floatingIps` | Floating IP management |
| `team` | Teams, members, groups |
| `container` | Container projects and workloads |
| `storage` | Object storage |
| `plus` | Plus subscription |
| `permissions` | Delegated access |
| `addresses` | Account addresses |
| `publicApi` | Public catalog, abuse, reviews |
| `health` / `ping` / `openApi` | System endpoints |

## Error codes

See [docs/ERROR_CODES.md](./docs/ERROR_CODES.md) for common codes and handling patterns.

All codes are exported as `ApiErrorCodes` and `ApiErrorCode` type.

## Examples

```bash
IGNITE_EMAIL=... IGNITE_PASSWORD=... npx tsx examples/auth.ts
IGNITE_TOKEN=... npx tsx examples/services.ts
IGNITE_TOKEN=... npx tsx examples/checkout.ts
IGNITE_TOKEN=... IGNITE_INVOICE_ID=... npx tsx examples/pay-invoice.ts
```

## Development

```bash
npm install
npm run build
```

Output is written to `dist/`.

## Generate from OpenAPI

From the repo root:

```bash
bun run docs:api
bun run sdk:ts
```

`docs:api` must run first (`apps/backend/app/openapi.generated.json`).

## CI & releases

The client is versioned in `public-api/typescript` of the monorepo. Bump `"version"` in `package.json` when you want a new major/minor/patch line.

## License

See [LICENSE.md](./LICENSE.md). Unmodified use in your own projects is permitted; modification is not.
