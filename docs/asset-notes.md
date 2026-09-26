# GROUND asset notes

Prepared 2026-09-26. Read-only inspection of `path/to/source.zip`, plus public issuer documentation and public asset metadata. No package code was executed. This file is implementation reference data, not evidence of GROUND trading integrations.

## Display contract

- This research layer covers 11 references: 9 xStocks with saved Solana prices plus USDY and XAUm information cards. The complete application also includes all 1,936 archive records.
- This research layer contains saved observations. Separate market-reference and read-only wallet integrations now provide labelled fetched data; executable quotes, returns and yields are not invented. Missing values are `null`, displayed as `—` or `Quote unavailable`; never display missing data as `$0` or `0%`.
- The 9 saved prices use `quoteStatus: "snapshot"`. Label them `Saved price · 23 Sep 2026` and disclose the full timestamp in details. The timestamp below is the catalogue capture time; individual price observation times were not separately saved.
- Mint confirmation identifies a token; it does not confirm that GROUND can trade it, that any quote is current, or that the user is eligible.
- Historical `OPEN/THIN/WATCH` stamps are archive measurements. In a new interface use `Snapshot` for the 9 priced assets and `Information only` for USDY/XAUm. If legacy stamps are retained, prefix `At snapshot` and show their date.
- GROUND platform token: `mint: null`, `launchStatus: "not-issued"`. Do not reuse the GRAIL Robinhood-chain address or invent a Solana CA.

## Saved catalogue provenance

- ZIP entry: `src/components/sites/grailassets-shop-587a201d/root-8a5edab2/catalogue.json`.
- `snapshotAt`: `2026-09-23T13:00:28.464Z`.
- Catalogue `probedAt`: `2026-09-23T13:02:53.192Z`. Each asset also has its own `probe.probedAt`.
- The original dataset has 1,936 rows, of which 1,042 have `chain === "solana"`; the current application restores every row. The 11 research-enriched references below remain a separate layer for official rights descriptions and Blueprint labels; they no longer limit the directory.
- `priceSource: "dex pair"` is the archive author’s provenance label. The paired URLs below were saved in the JSON; current prices were not requested from them.
- Raw files are read from the ZIP only; the complete source tree was not extracted.

## 9 Solana xStocks: saved values

| Slug | Symbol / reference | GROUND role | Saved price USD | Chain | Source label |
| --- | --- | --- | ---: | --- | --- |
| `aaplx` | AAPLx / Apple xStock | `enterprise` | 342.55 | `solana` | `dex pair` |
| `nvdax` | NVDAx / NVIDIA xStock | `enterprise` | 228.0036 | `solana` | `dex pair` |
| `tslax` | TSLAx / Tesla xStock | `enterprise` | 377.75 | `solana` | `dex pair` |
| `msftx` | MSFTx / Microsoft xStock | `enterprise` | 505.17 | `solana` | `dex pair` |
| `amznx` | AMZNx / Amazon xStock | `enterprise` | 254.86 | `solana` | `dex pair` |
| `googlx` | GOOGLx / Alphabet xStock | `enterprise` | 351.16 | `solana` | `dex pair` |
| `spyx` | SPYx / SPDR S&P 500 ETF xStock | `diversified-equity` | 776.74 | `solana` | `dex pair` |
| `qqqx` | QQQx / Invesco QQQ xStock | `diversified-equity` | 746.7 | `solana` | `dex pair` |
| `gldx` | GLDx / SPDR Gold Shares xStock | `gold-exposure` | 393.17 | `solana` | `dex pair` |

All 9 have `perOz: false` and `unit: "share"` in the archive. In GROUND describe quantities as illustrative xStock displayed units. In particular, GLDx is a tokenized gold-ETF exposure, not a physical-gold token; do not convert GLDx units into grams or troy ounces.

## Solana mint verification

Public GET requests to issuer API `https://api.xstocks.fi/api/v2/public/assets/{symbol}` on 2026-09-26 returned each mint below in `deployments[]` with `network === "Solana"`. All 9 matched the archive `address` exactly. Only asset metadata was used; the API’s trading flags were not taken as evidence of GROUND integration.

| Symbol | Solana mint | Public issuer metadata |
| --- | --- | --- |
| AAPLx | `XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/AAPLx) |
| NVDAx | `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/NVDAx) |
| TSLAx | `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/TSLAx) |
| MSFTx | `XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/MSFTx) |
| AMZNx | `Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/AMZNx) |
| GOOGLx | `XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/GOOGLx) |
| SPYx | `XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/SPYx) |
| QQQx | `Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/QQQx) |
| GLDx | `Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re` | [Issuer metadata](https://api.xstocks.fi/api/v2/public/assets/GLDx) |

The issuer [Assets API documentation](https://docs.xstocks.fi/apis/openapi/assets) defines the public metadata endpoint. [xStocks FAQ](https://docs.xstocks.fi/docs/frequently-asked-questions) describes xStocks as tracker certificates giving economic exposure, without shareholder voting rights. Issuance/redemption and jurisdictional eligibility have their own requirements.

The [developer guide](https://docs.xstocks.fi/developers) states that Solana xStocks use Token-2022 and a scaled display multiplier. Any later wallet integration must apply the multiplier for displayed quantities. Do not equate a raw onchain token balance with displayed shares.

## Raw archive records for direct implementation

The JSON below is copied from the selected archive rows with only nonessential fields omitted. It is source evidence, not a proposed live API. Put this in a `snapshot` field if used in application data, separate from current `quote` and `execution` states.

```json
{
  "snapshotAt": "2026-09-23T13:00:28.464Z",
  "assets": [
    {
      "slug": "aaplx",
      "name": "Apple xStock",
      "symbol": "AAPLx",
      "issuer": "Backed Finance",
      "category": "equities",
      "unit": "share",
      "unitLabel": "Apple shares, tokenized",
      "perOz": false,
      "priceUsd": 342.55,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
      "pairUrl": "https://dexscreener.com/solana/ckwjzwm7oj3nu4653n1epdrqxbxayxopfipeenlouf8y",
      "dex": "raydium",
      "quote": "USDC",
      "liquidityUsd": 441667.37,
      "quoteReservesUsd": 220833.685,
      "routes": 8,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 80272.21138785337,
        "reason": "fills to $80,272 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Byreal",
        "hops": 3,
        "blockRef": 449696187,
        "probedAt": "2026-09-23T11:56:28.838Z",
        "filledRungs": 6,
        "kneeUsd": 80272.21138785337,
        "atLeast": false
      }
    },
    {
      "slug": "nvdax",
      "name": "NVIDIA xStock",
      "symbol": "NVDAx",
      "issuer": "Backed Finance",
      "category": "equities",
      "unit": "share",
      "unitLabel": "NVIDIA shares, tokenized",
      "perOz": false,
      "priceUsd": 228.0036,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
      "pairUrl": "https://dexscreener.com/solana/49imatqtoyabsyaqc8gafvq6aebfvdxsrh44oiatyyw6",
      "dex": "raydium",
      "quote": "USDC",
      "liquidityUsd": 2983691.13,
      "quoteReservesUsd": 1491845.565,
      "routes": 6,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 290294.54885755206,
        "reason": "fills to $290,295 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Raydium CLMM",
        "hops": 3,
        "blockRef": 449695830,
        "probedAt": "2026-09-23T11:54:54.023Z",
        "filledRungs": 7,
        "kneeUsd": 290294.54885755206,
        "atLeast": false
      }
    },
    {
      "slug": "tslax",
      "name": "Tesla xStock",
      "symbol": "TSLAx",
      "issuer": "Backed Finance",
      "category": "equities",
      "unit": "share",
      "unitLabel": "Tesla shares, tokenized",
      "perOz": false,
      "priceUsd": 377.75,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
      "pairUrl": "https://dexscreener.com/solana/8adabqktrs6hvmjyc6ezebgdiaxhlygridwkwwp1npff",
      "dex": "raydium",
      "quote": "USDC",
      "liquidityUsd": 2245129.62,
      "quoteReservesUsd": 1122564.81,
      "routes": 7,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 387777.6638744273,
        "reason": "fills to $387,778 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "BinaryFi",
        "hops": 3,
        "blockRef": 449695897,
        "probedAt": "2026-09-23T11:55:11.894Z",
        "filledRungs": 7,
        "kneeUsd": 387777.6638744273,
        "atLeast": false
      }
    },
    {
      "slug": "msftx",
      "name": "Microsoft xStock",
      "symbol": "MSFTx",
      "issuer": "Backed Finance",
      "category": "equities",
      "unit": "share",
      "unitLabel": "Microsoft shares, tokenized",
      "perOz": false,
      "priceUsd": 505.17,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
      "pairUrl": "https://dexscreener.com/solana/clu4kfm4nb67xrdn7vjnmxxxir8z5ha4hjuzpfccxjsl",
      "dex": "raydium",
      "quote": "USDC",
      "liquidityUsd": 537072.17,
      "quoteReservesUsd": 268536.085,
      "routes": 5,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 83045.01423230859,
        "reason": "fills to $83,045 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Raydium CLMM",
        "hops": 4,
        "blockRef": 449696164,
        "probedAt": "2026-09-23T11:56:21.518Z",
        "filledRungs": 6,
        "kneeUsd": 83045.01423230859,
        "atLeast": false
      }
    },
    {
      "slug": "amznx",
      "name": "Amazon xStock",
      "symbol": "AMZNx",
      "issuer": "Backed Finance",
      "category": "equities",
      "unit": "share",
      "unitLabel": "Amazon shares, tokenized",
      "perOz": false,
      "priceUsd": 254.86,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
      "pairUrl": "https://dexscreener.com/solana/6m5axave4uh6kt4ytkyclwnmjd8pyp5vujwnctycruid",
      "dex": "raydium",
      "quote": "USDC",
      "liquidityUsd": 372094.03,
      "quoteReservesUsd": 186047.015,
      "routes": 3,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 96723.943038218,
        "reason": "fills to $96,724 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Quantum",
        "hops": 4,
        "blockRef": 449697979,
        "probedAt": "2026-09-23T12:04:22.198Z",
        "filledRungs": 6,
        "kneeUsd": 96723.943038218,
        "atLeast": false
      }
    },
    {
      "slug": "googlx",
      "name": "Alphabet xStock",
      "symbol": "GOOGLx",
      "issuer": "Backed Finance",
      "category": "equities",
      "unit": "share",
      "unitLabel": "Alphabet shares, tokenized",
      "perOz": false,
      "priceUsd": 351.16,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
      "pairUrl": "https://dexscreener.com/solana/b8yawjgyk6qidwzgbxmaxp7nyfg8g74ez3y4gfssobrw",
      "dex": "raydium",
      "quote": "USDC",
      "liquidityUsd": 579856.52,
      "quoteReservesUsd": 289928.26,
      "routes": 9,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 157300.71025867452,
        "reason": "fills to $157,301 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Whirlpool",
        "hops": 3,
        "blockRef": 449696055,
        "probedAt": "2026-09-23T11:55:53.374Z",
        "filledRungs": 6,
        "kneeUsd": 157300.71025867452,
        "atLeast": false
      }
    },
    {
      "slug": "spyx",
      "name": "SPDR S&P 500 ETF xStock",
      "symbol": "SPYx",
      "issuer": "Backed Finance",
      "category": "etfs",
      "unit": "share",
      "unitLabel": "SPDR S&P 500 ETF shares, tokenized",
      "perOz": false,
      "priceUsd": 776.74,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
      "pairUrl": "https://dexscreener.com/solana/6truu3rzuib9rkqg4vyc3dt3qwv7dgwgqxryucrvndde",
      "dex": "raydium",
      "quote": "USDC",
      "liquidityUsd": 3167893.37,
      "quoteReservesUsd": 1583946.685,
      "routes": 9,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 1023645.6524432783,
        "reason": "fills to $1,023,646 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Byreal",
        "hops": 4,
        "blockRef": 449695966,
        "probedAt": "2026-09-23T11:55:30.274Z",
        "filledRungs": 8,
        "kneeUsd": 1023645.6524432783,
        "atLeast": false
      }
    },
    {
      "slug": "qqqx",
      "name": "Invesco QQQ xStock",
      "symbol": "QQQx",
      "issuer": "Backed Finance",
      "category": "etfs",
      "unit": "share",
      "unitLabel": "Invesco QQQ shares, tokenized",
      "perOz": false,
      "priceUsd": 746.7,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
      "pairUrl": "https://dexscreener.com/solana/b6fetqdwsq8wuw4g52pw9wewea7algfyugxdrkigdshh",
      "dex": "raydium",
      "quote": "SOL",
      "liquidityUsd": 189088.2,
      "quoteReservesUsd": 94544.1,
      "routes": 5,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 257966.5275015667,
        "reason": "fills to $257,967 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Riptide",
        "hops": 4,
        "blockRef": 449695863,
        "probedAt": "2026-09-23T11:55:03.112Z",
        "filledRungs": 7,
        "kneeUsd": 257966.5275015667,
        "atLeast": false
      }
    },
    {
      "slug": "gldx",
      "name": "SPDR Gold Shares xStock",
      "symbol": "GLDx",
      "issuer": "Backed Finance",
      "category": "etfs",
      "unit": "share",
      "unitLabel": "SPDR Gold Shares shares, tokenized",
      "perOz": false,
      "priceUsd": 393.17,
      "priceSource": "dex pair",
      "chain": "solana",
      "chains": [
        "solana"
      ],
      "address": "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re",
      "pairUrl": "https://dexscreener.com/solana/hxrqs96uhco2a8lxtvuwb9e2ts963ec6nykvzso9tdii",
      "dex": "orca",
      "quote": "SOL",
      "liquidityUsd": 161996.99,
      "quoteReservesUsd": 80998.495,
      "routes": 6,
      "stamp": {
        "state": "OPEN",
        "cleanToUsd": 701994.5202558791,
        "reason": "fills to $701,995 at 2%",
        "method": "probe",
        "atLeast": false
      },
      "curve": [
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
      ],
      "probe": {
        "engine": "jupiter",
        "engineVersion": "probe-1.0.0",
        "coverage": "measured",
        "venue": "Raydium CLMM",
        "hops": 4,
        "blockRef": 449696000,
        "probedAt": "2026-09-23T11:55:39.079Z",
        "filledRungs": 7,
        "kneeUsd": 701994.5202558791,
        "atLeast": false
      }
    }
  ]
}
```

## USDY: Treasury-related information card

- Source archive slug: `usdy`; original `category: "treasuries"`, `chain: "ethereum"`, `chains: ["solana", "ethereum", "mantle", "sui"]`.
- Original `address: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C"`, `priceUsd: 1.12`, `priceSource: "dex pair"` are Ethereum observations. Do not place that address or price in a Solana quote record.
- The [official Ondo addresses page](https://docs.ondo.finance/addresses) lists Solana USDY mint `A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6`. This is separately verified reference metadata, not a mint from the archive.
- [USDY product page](https://ondo.finance/usdy) confirms Solana support. [USDY Basics](https://docs.ondo.finance/general-access-products/usdy/basics) describes a tokenized note with Treasury-related backing and eligibility requirements. The note is not a direct holding of US Treasuries.
- GROUND copy: `Treasury-related note · Ondo · Eligibility applies`. Role: `cash-management-reference`; avoid suggesting an insured deposit or a fixed `$1` stablecoin.
- UI state: `quoteStatus: "unavailable"`, `priceUsd: null`, `priceObservedAt: null`, `executionStatus: "unavailable"`, `displayLabel: "Information only"`, `network: "solana"`. APY and current redemption value remain `null`.

## XAUm: physical-gold information card

- Source archive slug: `xaum`; original `category: "precious-metals"`, `chain: "bsc"`, `chains: ["bsc"]`.
- Original `address: "0x23AE4fd8E7844cdBc97775496eBd0E8248656028"`, `priceUsd: 4288.34`, `priceSource: "dex pair"`, `perOz: true` are BNB Chain observations. Do not reuse them as a Solana quote.
- The [official Matrixdock product page](https://www.matrixdock.com/xaum) describes each XAUm as representing one troy ounce of physical gold, with redemption conditions. The [Solana Foundation announcement](https://solana.com/fr/news/matrixdock-xaum-launch), dated 10 February 2026, confirms the Solana deployment.
- [Matrixdock Contract Address documentation](https://matrixdock.gitbook.io/matrixdock-docs/english/gold-token-xaum/smart-contract/contract-address) lists Solana token address `5aLhp9VnUEKcsdtkfsf2DUgpJfomx7GmYVny24dHUZoB`. The address was visible in the official documentation search result on 2026-09-26; direct web-tool fetch timed out. Treat the identity as documented reference metadata, not a chain-state audit.
- GROUND copy: `Physical-gold reference · Matrixdock · 1 troy oz per token according to issuer`. Role: `physical-gold-reference`.
- UI state: `quoteStatus: "unavailable"`, `priceUsd: null`, `priceObservedAt: null`, `executionStatus: "unavailable"`, `displayLabel: "Information only"`, `network: "solana"`. Do not calculate purchasable gold grams from the old BNB price.

## Keep source states distinct

```json
{
  "platformToken": {
    "name": "GROUND",
    "network": "solana",
    "mint": null,
    "launchStatus": "not-issued"
  },
  "quoteStates": {
    "snapshot": {
      "valueSource": "archive",
      "asOf": "2026-09-23T13:00:28.464Z",
      "live": false
    },
    "unavailable": {
      "priceUsd": null,
      "asOf": null,
      "live": false
    }
  },
  "execution": {
    "status": "unavailable",
    "walletConnected": false
  }
}
```

Historical curves are saved probe samples. Some are nonmonotonic across rung sizes; retain raw points if charted and label them as saved observations. Do not make a sell-capacity claim from data that does not record probe direction, and do not invent a performance chart or a fiat/SOL exchange rate from these fields.
