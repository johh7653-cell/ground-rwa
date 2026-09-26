<p align="center"><img src="../github/assets/ground-mark.png" alt="GROUND" width="64" /></p>

# ground-catalogue

**Every record keeps its source.**

[GROUND](../../README.md) · [Workspace](workspace.md) · [Catalogue](catalogue.md) · [Markets](market.md) · [Wallet](wallet.md) · [API](interface.md) · [Canon](canon.md)

---

The library contains the complete imported archive, including records without a price or route. Search and asset details operate across the entire dataset.

## The preserved library

| Field | Value |
| --- | --- |
| Assets | 1,936 |
| Issuers | 50 |
| Categories | 16 |
| Networks | 16 |
| Primary Solana quote-network records | 1,042 |
| Dated snapshot | 23 September 2026 |

An observation’s quote network and a product’s supported deployments are separate fields. Missing prices stay null. Original asset and issuer images are mapped locally; available archive curves remain attached to their records.

## Inspect the implementation

[Original catalogue JSON](../../src/data/catalogue.json) · [Catalogue data layer](../../src/lib/catalogue.ts) · [Identity media](../../public/catalogue-media) · [Source audit](../original-data-audit.md) · [Method](../METHOD.md)

The preserved JSON SHA-256 is `38260d846d8d00077e3d563106c3facebb13491cc64e8eae1733c1cf34bb6df1`.

![Complete asset directory](../preview-assets.png)
