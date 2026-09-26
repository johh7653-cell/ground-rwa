export type CategoryId = "companies" | "indices" | "gold" | "treasuries";

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
}

export const categories: Category[] = [
  { id: "gold", name: "Gold exposure", shortName: "Gold", description: "Explore gold-linked assets." },
  { id: "companies", name: "Company exposure", shortName: "Companies", description: "Follow the businesses you know." },
  { id: "indices", name: "Broad indices", shortName: "Indices", description: "See markets through a wider lens." },
  { id: "treasuries", name: "Treasury-linked", shortName: "Treasury-linked", description: "Explore Treasury-linked instruments." },
];

export interface HistoricalPoint {
  sizeUsd: number;
  impact: number | null;
  filled: boolean;
}

export interface HistoricalCurveData {
  observedAt: string;
  engine: string;
  points: HistoricalPoint[];
}

export interface Asset {
  slug: string;
  name: string;
  symbol: string;
  issuer: string;
  issuerShort: string;
  categoryId: CategoryId;
  exposure: string;
  underlying: string;
  summary: string;
  structure: string;
  rights: string;
  backing: string;
  eligibility: string;
  redemption: string;
  officialUrl: string;
  deploymentSourceUrl: string;
  rightsSourceUrl: string;
  sourceCheckedAt: string;
  network: "Solana";
  status: "snapshot" | "research";
  snapshotPrice: number | null;
  snapshotAt: string | null;
  snapshotSource: string | null;
  historicalCurve: HistoricalCurveData | null;
}

// Prices and probe points are dated observations, never executable quotes.
// Product identities and official documents were checked separately on 26 Sep 2026.
export const assets: Asset[] = [
  {
    "slug": "spyx",
    "name": "SPDR S&P 500 ETF xStock",
    "symbol": "SPYx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "indices",
    "exposure": "S&P 500 ETF exposure",
    "underlying": "SPDR S&P 500 ETF Trust",
    "summary": "A broader view of large US companies, through an ETF-linked tracker.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/sp500-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/SPYx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 776.74,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:55:30.274Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 2.5e-05,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 5.1e-05,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.000182,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.000461,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.001612,
          "filled": true
        },
        {
          "sizeUsd": 1000000,
          "impact": 0.010605,
          "filled": true
        },
        {
          "sizeUsd": 5000000,
          "impact": 1.599911,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "tslax",
    "name": "Tesla xStock",
    "symbol": "TSLAx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "companies",
    "exposure": "Tesla equity exposure",
    "underlying": "Tesla, Inc.",
    "summary": "A stock-linked tracker connected to Tesla, rather than direct company shares.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/tesla-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/TSLAx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 377.75,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:55:11.894Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 4e-06,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 0.00402,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.000143,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.000807,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.00729,
          "filled": true
        },
        {
          "sizeUsd": 1000000,
          "impact": 0.076477,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "gldx",
    "name": "SPDR Gold Shares xStock",
    "symbol": "GLDx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "gold",
    "exposure": "Gold ETF exposure",
    "underlying": "SPDR Gold Shares",
    "summary": "Gold-price exposure through a tokenized ETF tracker. This is different from a physical-gold token.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/gold-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/GLDx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 393.17,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:55:39.079Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 9e-06,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 3.2e-05,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.000169,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.000866,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.003467,
          "filled": true
        },
        {
          "sizeUsd": 1000000,
          "impact": 0.0309,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "aaplx",
    "name": "Apple xStock",
    "symbol": "AAPLx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "companies",
    "exposure": "Apple equity exposure",
    "underlying": "Apple Inc.",
    "summary": "A stock-linked tracker connected to Apple’s market performance.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/apple-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/AAPLx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 342.55,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:56:28.838Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 0.000229,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 0.000314,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.001049,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.005579,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.100855,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "nvdax",
    "name": "NVIDIA xStock",
    "symbol": "NVDAx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "companies",
    "exposure": "NVIDIA equity exposure",
    "underlying": "NVIDIA Corporation",
    "summary": "A stock-linked tracker connected to NVIDIA’s market performance.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/nvidia-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/NVDAx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 228.0036,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:54:54.023Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 6e-06,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 2.7e-05,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.000134,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.00042,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.001891,
          "filled": true
        },
        {
          "sizeUsd": 1000000,
          "impact": 0.338958,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "msftx",
    "name": "Microsoft xStock",
    "symbol": "MSFTx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "companies",
    "exposure": "Microsoft equity exposure",
    "underlying": "Microsoft Corporation",
    "summary": "A stock-linked tracker connected to Microsoft’s market performance.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/microsoft-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/MSFTx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 505.17,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:56:21.518Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 3.2e-05,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 0.000158,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.000998,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.005976,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.090855,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "amznx",
    "name": "Amazon xStock",
    "symbol": "AMZNx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "companies",
    "exposure": "Amazon equity exposure",
    "underlying": "Amazon.com, Inc.",
    "summary": "A stock-linked tracker connected to Amazon’s market performance.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/amazon-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/AMZNx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 254.86,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T12:04:22.198Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 0.000745,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.003483,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.008496,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.057739,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "googlx",
    "name": "Alphabet xStock",
    "symbol": "GOOGLx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "companies",
    "exposure": "Alphabet equity exposure",
    "underlying": "Alphabet Inc. Class A",
    "summary": "A stock-linked tracker connected to Alphabet’s Class A shares.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/alphabet-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/GOOGLx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 351.16,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:55:53.374Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 0.000194,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 0.000744,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 0.001977,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.006287,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.031847,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "qqqx",
    "name": "Invesco QQQ xStock",
    "symbol": "QQQx",
    "issuer": "Backed Assets (JE) Limited",
    "issuerShort": "xStocks / Backed",
    "categoryId": "indices",
    "exposure": "Nasdaq-100 ETF exposure",
    "underlying": "Invesco QQQ Trust",
    "summary": "An ETF-linked tracker offering a view of the Nasdaq-100, through Invesco QQQ.",
    "structure": "Tracker certificate",
    "rights": "Economic exposure to the underlying price. Holding this tracker does not give you shareholder voting rights or direct ownership of the underlying security.",
    "backing": "The issuer states that the product is collateralized by the underlying security held in custody. Read the product documents for its custody structure.",
    "eligibility": "Regional restrictions apply. Access to issuer issuance and redemption requires onboarding and identity checks. Secondary-market rules vary by platform.",
    "redemption": "Issuer redemption follows the product terms, including eligibility, minimums and fees. No redemption service is connected in this preview.",
    "officialUrl": "https://assets.backed.fi/products/nasdaq-xstock",
    "deploymentSourceUrl": "https://api.xstocks.fi/api/v2/public/assets/QQQx",
    "rightsSourceUrl": "https://docs.xstocks.fi/docs/frequently-asked-questions",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "snapshot",
    "snapshotPrice": 746.7,
    "snapshotAt": "2026-09-23T13:00:28.464Z",
    "snapshotSource": "Saved catalogue · DEX pair observation",
    "historicalCurve": {
      "observedAt": "2026-09-23T11:55:03.112Z",
      "engine": "Jupiter",
      "points": [
        {
          "sizeUsd": 100,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 500,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 2000,
          "impact": 0,
          "filled": true
        },
        {
          "sizeUsd": 10000,
          "impact": 9.3e-05,
          "filled": true
        },
        {
          "sizeUsd": 50000,
          "impact": 0.00085,
          "filled": true
        },
        {
          "sizeUsd": 250000,
          "impact": 0.012878,
          "filled": true
        },
        {
          "sizeUsd": 1000000,
          "impact": 0.683339,
          "filled": true
        }
      ]
    }
  },
  {
    "slug": "usdy",
    "name": "Ondo US Dollar Yield",
    "symbol": "USDY",
    "issuer": "Ondo Global Markets (BVI) Limited",
    "issuerShort": "Ondo",
    "categoryId": "treasuries",
    "exposure": "Treasury-linked note",
    "underlying": "Treasury-related assets and bank deposits",
    "summary": "A tokenized note with Treasury-related backing. Product structure and eligibility matter as much as the underlying assets.",
    "structure": "Tokenized debt instrument",
    "rights": "Economic exposure through a note. USDY is not itself a US Treasury and does not grant a right to hold or receive the underlying Treasuries.",
    "backing": "Ondo describes Treasury-related backing, including short-term US Treasuries, Treasury ETF shares or bank deposits depending on issuance terms.",
    "eligibility": "Available to qualifying non-US investors, subject to further jurisdiction and product restrictions. Issuer subscriptions and redemptions require onboarding.",
    "redemption": "Subscriptions and redemptions depend on the issuer’s current terms and supported network. GROUND has not connected these services.",
    "officialUrl": "https://ondo.finance/usdy",
    "deploymentSourceUrl": "https://docs.ondo.finance/addresses",
    "rightsSourceUrl": "https://docs.ondo.finance/general-access-products/usdy/basics",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "research",
    "snapshotPrice": null,
    "snapshotAt": null,
    "snapshotSource": null,
    "historicalCurve": null
  },
  {
    "slug": "xaum",
    "name": "Matrixdock Gold",
    "symbol": "XAUm",
    "issuer": "Matrixdock",
    "issuerShort": "Matrixdock",
    "categoryId": "gold",
    "exposure": "Physical-gold reference",
    "underlying": "Allocated physical gold",
    "summary": "A physical-gold token described by its issuer as representing one troy ounce of gold. Different rights and redemption terms from a gold ETF tracker.",
    "structure": "Physical-gold-backed token",
    "rights": "The issuer describes each token as representing one troy ounce of allocated gold, with physical redemption subject to product terms. Small token quantities do not imply immediate delivery of a gold bar.",
    "backing": "Matrixdock states that XAUm is backed by physical gold from LBMA-accredited refiners held in Asian vaults. Consult its reserve and custody documents.",
    "eligibility": "Onboarding, jurisdiction and redemption conditions apply. Confirm current terms directly with the issuer.",
    "redemption": "Physical redemption is subject to the issuer’s minimums, checks and delivery arrangements. No redemption service is connected in this preview.",
    "officialUrl": "https://www.matrixdock.com/xaum",
    "deploymentSourceUrl": "https://matrixdock.gitbook.io/matrixdock-docs/english/gold-token-xaum/smart-contract/contract-address",
    "rightsSourceUrl": "https://www.matrixdock.com/xaum",
    "sourceCheckedAt": "2026-09-26",
    "network": "Solana",
    "status": "research",
    "snapshotPrice": null,
    "snapshotAt": null,
    "snapshotSource": null,
    "historicalCurve": null
  }
];

export const featuredSlugs = ["spyx", "tslax", "gldx", "usdy"] as const;

export function getAsset(slug: string): Asset | undefined {
  return assets.find((asset) => asset.slug === slug);
}

export function getCategory(id: CategoryId): Category {
  return categories.find((category) => category.id === id)!;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSnapshotDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatSnapshotTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value)) + " UTC";
}
