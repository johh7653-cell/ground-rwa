import mediaMap from "@/data/catalogue-media-map.json";
import type { ArchivedAsset } from "@/lib/catalogue";

// Only identity-image paths are bundled here, not the complete asset catalogue.
const assetImages = new Map<string, string>(Object.entries(mediaMap.tokens));
const issuerImages = new Map<string, string>(Object.entries(mediaMap.issuers));

export function assetMediaUrl(
  asset: Pick<ArchivedAsset, "slug">,
): string | null {
  // Slugs are unique in the archive; symbols/names should not merge identities.
  return assetImages.get(asset.slug) ?? null;
}

export function issuerMediaUrl(name: string): string | null {
  return issuerImages.get(name) ?? null;
}
