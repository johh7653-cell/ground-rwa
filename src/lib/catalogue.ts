import savedCatalogue from "@/data/catalogue.json";

export type ArchivedStampState = "OPEN" | "THIN" | "WATCH";

export interface ArchivedCurvePoint {
  sizeUsd: number;
  /** A ratio: 0.02 means 2%. Values are the saved observations. */
  impact: number | null;
  filled: boolean;
}

export interface ArchivedProbe {
  engine: string;
  engineVersion: string;
  coverage: string;
  venue: string | null;
  hops: number | null;
  blockRef: number | string | null;
  probedAt: string;
  filledRungs: number;
  kneeUsd: number;
  atLeast: boolean;
}

export interface ArchivedAsset {
  slug: string;
  name: string;
  symbol: string;
  issuer: string;
  category: string;
  backing: string;
  desc: string;
  unit: string;
  unitLabel: string;
  perOz: boolean;
  priceUsd: number | null;
  priceSource: string | null;
  /** The network of the archived observation, not every supported network. */
  chain: string | null;
  chains: string[];
  address: string | null;
  /** Some links index a token address; they do not establish a trading pair. */
  pairUrl: string | null;
  dex: string | null;
  quote: string | null;
  liquidityUsd: number | null;
  quoteReservesUsd: number | null;
  fdv: number | null;
  marketCap: number | null;
  routes: number;
  imageUrl: string | null;
  stamp: {
    state: ArchivedStampState;
    cleanToUsd: number | null;
    quoteReservesUsd?: number;
    reason: string;
    method?: string;
    atLeast?: boolean;
    partial?: boolean;
  };
  curve?: ArchivedCurvePoint[];
  probe?: ArchivedProbe;
  holders?: number | null;
  source?: string;
  permalink?: string;
}

export interface ArchivedCategory {
  id: string;
  label: string;
  count: number;
}

export interface ArchivedIssuer {
  name: string;
  site: string;
  count: number;
  categories: string[];
  open: number;
}

export interface ArchivedCatalogue {
  snapshotAt: string;
  probedAt: string;
  rule: {
    impactCap: number;
    openMinUsd: number;
    thinMinReservesUsd: number;
    quoteReserves: string;
    ladder: number[];
    engineVersion: string;
    method: string;
    measuredAssets: number;
  };
  stats: {
    assets: number;
    issuers: number;
    networks: number;
    open: number;
    thin: number;
    watch: number;
  };
  categories: ArchivedCategory[];
  issuers: ArchivedIssuer[];
  networks: string[];
  assets: ArchivedAsset[];
}

/** An imported, dated archive. No provider requests are made by this module. */
export const catalogue = savedCatalogue as ArchivedCatalogue;
export const archiveAssets = catalogue.assets;
export const archiveCategories = catalogue.categories;
export const archiveIssuers = catalogue.issuers;
export const archiveNetworks = catalogue.networks;

const assetsBySlug = new Map(archiveAssets.map((asset) => [asset.slug, asset]));
const labelsByCategory = new Map(
  archiveCategories.map((category) => [category.id, category.label]),
);

export function getArchivedAsset(slug: string): ArchivedAsset | undefined {
  return assetsBySlug.get(slug);
}

export function categoryLabel(id: string): string {
  return labelsByCategory.get(id) ?? id;
}

const networkLabels: Record<string, string> = {
  algorand: "Algorand",
  arbitrum: "Arbitrum",
  avalanche: "Avalanche",
  base: "Base",
  bsc: "BNB Chain",
  celo: "Celo",
  ethereum: "Ethereum",
  gnosis: "Gnosis",
  mantle: "Mantle",
  plume: "Plume",
  polygon: "Polygon",
  robinhood: "Robinhood Chain",
  solana: "Solana",
  stellar: "Stellar",
  sui: "Sui",
  xdc: "XDC",
};

export function networkLabel(id: string | null): string {
  return id === null ? "—" : (networkLabels[id] ?? id);
}

const usdPrice = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const smallPrice = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 3,
});

export function formatArchivedPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value >= 1 ? usdPrice.format(value) : `$${smallPrice.format(value)}`;
}

export type ArchivedSourceId =
  | "dex pair"
  | "jupiter price"
  | "issuer price"
  | "issuer NAV"
  | "unknown";

export interface ArchivedSourceGroup {
  id: ArchivedSourceId;
  label: string;
  count: number;
  url: string | null;
  description: string;
}

const sourceCounts = new Map<string, number>();
for (const asset of archiveAssets) {
  const id = asset.priceSource ?? "unknown";
  sourceCounts.set(id, (sourceCounts.get(id) ?? 0) + 1);
}

export const sourceGroups: ArchivedSourceGroup[] = [
  {
    id: "dex pair",
    label: "DEX pair snapshots",
    count: sourceCounts.get("dex pair") ?? 0,
    url: "https://dexscreener.com/",
    description:
      "Saved prices attributed to indexed DEX pairs. Asset records retain their network, venue and source link; these are historical observations.",
  },
  {
    id: "jupiter price",
    label: "Jupiter price snapshots",
    count: sourceCounts.get("jupiter price") ?? 0,
    url: "https://jup.ag/",
    description:
      "Saved Solana prices labelled Jupiter price in the archive. Token discovery links are separate from measured routes and live availability.",
  },
  {
    id: "issuer price",
    label: "Issuer product prices",
    count: sourceCounts.get("issuer price") ?? 0,
    url: "https://realt.co/",
    description:
      "Saved RealT product prices with individual issuer product links. An issuer product price does not establish a secondary-market quote.",
  },
  {
    id: "issuer NAV",
    label: "Issuer NAV references",
    count: sourceCounts.get("issuer NAV") ?? 0,
    url: null,
    description:
      "Saved issuer-stated net asset values. The relevant issuer is linked from each listing; a NAV reference is not an executable price.",
  },
  {
    id: "unknown",
    label: "No saved price",
    count: sourceCounts.get("unknown") ?? 0,
    url: null,
    description:
      "Catalogue records without a price at the snapshot time. Missing prices stay unavailable; identities, issuer links and any other saved fields remain available.",
  },
];
