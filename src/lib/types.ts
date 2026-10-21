export type ServerStatus = "online" | "offline" | "starting" | "stopping";

export type DashboardServer = {
  id: string;
  name: string;
  userDisplayName?: string | null;
  userNotes?: string | null;
  status: ServerStatus;
  ip: string;
  location: string;
  os: string;
  cpu: { used: number; total: number };
  ram: { used: number; total: number };
  disk: { used: number; total: number };
  bandwidth: { used: number; total: number };
  uptime: string;
  uptimeSeconds?: number;
  suspendedAt?: string | null;
  providerType?: string | null;
  providerStatus?: string | null;
  isShared?: boolean;
  sharedByName?: string | null;
  plusThrottleActive?: boolean;
  plusThrottledUntil?: string | null;
  plusPoolKey?: string | null;
  plusForecastTb?: number | null;
  suspendReason?: string | null;
  terminationPending?: boolean;
  reinstallPending?: boolean;
  isDomainService?: boolean;
  isCustomService?: boolean;
  customArticle?: { name?: string | null; description?: string | null } | null;
  domainName?: string | null;
  categoryFriendlyName?: string | null;
  providerAddress?: string | null;
  ploiStats?: {
    domain: string;
    storageUsedBytes: number;
    storageLimitBytes: number;
    storageStatus: string;
    storageStale?: boolean;
    dnsStatus: string;
    locationLabel?: string;
  };
  pleskStats?: {
    usedDomains: number;
    maxDomains: number;
    avgStorageUsedGb: number;
    storagePerDomainGb: number;
    usedMailboxes: number;
    maxMailboxesPerDomain: number;
    locationLabel: string;
  };
  mailcowStats?: {
    maxDomains: number;
    usedDomains: number;
    maxMailboxesPerDomain: number;
    usedMailboxes: number;
    storagePerMailboxGb: number;
    maxAliasesPerDomain: number;
    baseLimits?: {
      maxDomains: number;
      maxMailboxesPerDomain: number;
      storagePerMailboxGb: number;
      maxAliasesPerDomain: number;
    };
    maxMailboxesUsedPerDomain?: number;
    maxQuotaUsedGb?: number;
  };
  switchableProducts?: Array<{ id: string; name?: string; priceMonthly?: number }>;
  upgradePricing?: Record<
    string,
    { upgradePrice?: number; allowDowngrade?: boolean } | undefined
  >;
  billing?: {
    monthlyPrice?: number;
    periodPrice?: number;
    billingMode?: string;
    billingCycleDays?: number;
    currentPeriodEnd?: string | null;
  };
  productOptions?: {
    billingDiscountPerMonth?: number;
    billingSurcharge7d?: number;
    billingSurcharge14d?: number;
  };
  productId?: string;
  productSlug?: string;
  productName?: string;
  categoryId?: string;
};

export type DashboardStats = {
  totalServers: number;
  activeServers: number;
  totalBandwidth: number;
  openTickets: number;
};

export type MaintenanceNote = {
  id: string;
  serviceId: string;
  serviceName: string;
  startDate: string | null;
  endDate: string | null;
  title?: string | null;
  description?: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  role: "USER" | "SUPPORT" | "ADMIN";
  accountType?: string | null;
  companyName?: string | null;
  familyRole?: string | null;
  familyGroupId?: string | null;
  isMinor?: boolean;
  teamId?: string | null;
  requiresFamilyGroup?: boolean;
  familyAdoptionExempt?: boolean;
  familyAdoptionWarnLevel?: string | null;
  familyAdoptionDeadlineAt?: string | null;
  adoptionDeadlineEnforced?: boolean;
  phone?: string | null;
  dateOfBirth?: string | null;
  vatNumber?: string | null;
  locale?: string | null;
  identVerified?: boolean;
  nameChangedAt?: string | null;
  nameChangeAllowed?: boolean;
  nameChangeBlockedReason?: "under_14" | "cooldown" | null;
  nameChangeCooldownEndsAt?: string | null;
  emailNotifications?: boolean;
  loginNotificationEmailOptIn?: boolean;
  servicePowerActionEmailOptIn?: boolean;
  notificationSoundEnabled?: boolean;
  newsletterOptIn?: boolean;
  webPushNotifications?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  balance?: number | null;
  netPointsBalance?: number | null;
  plusActive?: boolean;
  plusBlocked?: boolean;
  plusPoolingEnabled?: boolean;
  plusPoolingMode?: "THROTTLE" | null;
  /** false, wenn Kunden-Stealth aktiv ist (keine Plus-UI) */
  plusCustomerUiVisible?: boolean;
  plusSlots?: number;
  plusExpiresAt?: string | null;
  /** true = es gibt noch BYOIP-Netze: Fläche bleibt auch ohne aktives Abo sichtbar. */
  byoipInUse?: boolean;
  /** true = es gibt noch BYOAS-Anträge/Netze: bleiben auch ohne aktives Abo sichtbar. */
  byoasInUse?: boolean;
};
