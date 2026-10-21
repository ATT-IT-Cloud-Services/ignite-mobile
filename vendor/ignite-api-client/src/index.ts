import { IgniteClient as BaseClient } from "./client.js";
import type { IgniteClientConfig } from "./types.js";
import {
  AuthResource,
  ServicesResource,
  BillingResource,
  CheckoutResource,
  ShopResource,
  DashboardResource,
  DomainsResource,
  SubdomainsResource,
  IpManagerResource,
  SshKeysResource,
  SupportResource,
  UserResource,
  WalletResource,
  BusinessResource,
  AffiliatesResource,
  FamilyResource,
  ByoipResource,
  FloatingIpsResource,
  AddressesResource,
  BlogPostsResource,
  ByoasResource,
  CaseReportsResource,
  ContainerResource,
  CouponsResource,
  DocumentsResource,
  EventsResource,
  HealthResource,
  IntegrationsResource,
  NewsletterResource,
  OpenApiResource,
  PermissionsResource,
  PingResource,
  PlusResource,
  PreordersResource,
  PublicApiResource,
  PublicSettingsResource,
  StorageResource,
  TeamResource,
  ThemeAssetsResource,
  TrafficResource,
  WebhooksResource,
} from "./resources/index.js";

/**
 * Full ignite API client with typed resource namespaces.
 *
 * Resource namespaces follow the public OpenAPI document
 * (host-root paths, e.g. /services — not legacy /api/services).
 *
 * @example
 * ```ts
 * const client = new IgniteClient({ baseUrl: "https://api.example.test" });
 * const result = await client.auth.login({ email, password, rememberMe: true });
 * client.setToken(result.token!);
 * const services = await client.services.list();
 * ```
 */
export class IgniteClient extends BaseClient {
  public readonly auth: AuthResource;
  public readonly services: ServicesResource;
  public readonly billing: BillingResource;
  public readonly checkout: CheckoutResource;
  public readonly shop: ShopResource;
  public readonly dashboard: DashboardResource;
  public readonly domains: DomainsResource;
  public readonly subdomains: SubdomainsResource;
  public readonly ipManager: IpManagerResource;
  public readonly sshKeys: SshKeysResource;
  public readonly support: SupportResource;
  public readonly user: UserResource;
  public readonly wallet: WalletResource;
  public readonly business: BusinessResource;
  public readonly affiliates: AffiliatesResource;
  public readonly family: FamilyResource;
  public readonly byoip: ByoipResource;
  public readonly floatingIps: FloatingIpsResource;
  public readonly addresses: AddressesResource;
  public readonly blogPosts: BlogPostsResource;
  public readonly byoas: ByoasResource;
  public readonly caseReports: CaseReportsResource;
  public readonly container: ContainerResource;
  public readonly coupons: CouponsResource;
  public readonly documents: DocumentsResource;
  public readonly events: EventsResource;
  public readonly health: HealthResource;
  public readonly integrations: IntegrationsResource;
  public readonly newsletter: NewsletterResource;
  public readonly openApi: OpenApiResource;
  public readonly permissions: PermissionsResource;
  public readonly ping: PingResource;
  public readonly plus: PlusResource;
  public readonly preorders: PreordersResource;
  public readonly publicApi: PublicApiResource;
  public readonly publicSettings: PublicSettingsResource;
  public readonly storage: StorageResource;
  public readonly team: TeamResource;
  public readonly themeAssets: ThemeAssetsResource;
  public readonly traffic: TrafficResource;
  public readonly webhooks: WebhooksResource;

  constructor(config: IgniteClientConfig) {
    super(config);
    this.auth = new AuthResource(this);
    this.services = new ServicesResource(this);
    this.billing = new BillingResource(this);
    this.checkout = new CheckoutResource(this);
    this.shop = new ShopResource(this);
    this.dashboard = new DashboardResource(this);
    this.domains = new DomainsResource(this);
    this.subdomains = new SubdomainsResource(this);
    this.ipManager = new IpManagerResource(this);
    this.sshKeys = new SshKeysResource(this);
    this.support = new SupportResource(this);
    this.user = new UserResource(this);
    this.wallet = new WalletResource(this);
    this.business = new BusinessResource(this);
    this.affiliates = new AffiliatesResource(this);
    this.family = new FamilyResource(this);
    this.byoip = new ByoipResource(this);
    this.floatingIps = new FloatingIpsResource(this);
    this.addresses = new AddressesResource(this);
    this.blogPosts = new BlogPostsResource(this);
    this.byoas = new ByoasResource(this);
    this.caseReports = new CaseReportsResource(this);
    this.container = new ContainerResource(this);
    this.coupons = new CouponsResource(this);
    this.documents = new DocumentsResource(this);
    this.events = new EventsResource(this);
    this.health = new HealthResource(this);
    this.integrations = new IntegrationsResource(this);
    this.newsletter = new NewsletterResource(this);
    this.openApi = new OpenApiResource(this);
    this.permissions = new PermissionsResource(this);
    this.ping = new PingResource(this);
    this.plus = new PlusResource(this);
    this.preorders = new PreordersResource(this);
    this.publicApi = new PublicApiResource(this);
    this.publicSettings = new PublicSettingsResource(this);
    this.storage = new StorageResource(this);
    this.team = new TeamResource(this);
    this.themeAssets = new ThemeAssetsResource(this);
    this.traffic = new TrafficResource(this);
    this.webhooks = new WebhooksResource(this);
  }
}

export { ApiError } from "./errors.js";
export { extractErrorCode } from "./extract-error-code.js";
export { ApiErrorCodes, ALL_API_ERROR_CODES, type ApiErrorCode } from "./error-codes.js";
export type { IgniteClientConfig, IgniteClientKind, QueryParams, QueryValue, ApiTransport } from "./types.js";
export { ResourceClient } from "./resource-client.js";
export * from "./resources/index.js";
export * as schemas from "./schemas/index.js";
