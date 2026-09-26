import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Building2, ChartColumnIncreasing, Coins, FileText } from "lucide-react";
import { assetMediaUrl } from "@/lib/catalogue-media";
import { type Asset, type CategoryId, formatSnapshotDate, formatUsd, getCategory } from "@/lib/assets";
import styles from "./AssetCard.module.css";

export function CategoryGlyph({ category, size = 28 }: { category: CategoryId; size?: number }) {
  const Glyph = category === "gold" ? Coins : category === "companies" ? Building2 : category === "indices" ? ChartColumnIncreasing : FileText;
  return <Glyph size={size} strokeWidth={1.5} aria-hidden="true" />;
}

export function AssetCard({ asset }: { asset: Asset }) {
  const hasSnapshot = asset.snapshotPrice !== null && asset.snapshotAt !== null;
  const image = assetMediaUrl(asset);
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.glyph}>
          {image ? <Image src={image} alt="" width={34} height={34} /> : <CategoryGlyph category={asset.categoryId} size={29} />}
        </span>
        <span className={styles.category}>{getCategory(asset.categoryId).shortName}</span>
      </div>
      <h3 className={styles.symbol}>{asset.symbol}</h3>
      <p className={styles.exposure}>{asset.exposure}</p>
      <div className={styles.information}>
        <p className={styles.issuer}>{asset.issuerShort}</p>
        <p className={styles.status}><span className={styles.dot} aria-hidden="true" />{hasSnapshot ? "Saved snapshot" : "Research only"}</p>
        <div className={styles.price}>
          <strong>{hasSnapshot ? formatUsd(asset.snapshotPrice!) : "Quote unavailable"}</strong>
          <span>{hasSnapshot ? <time dateTime={asset.snapshotAt!}>{formatSnapshotDate(asset.snapshotAt!)}</time> : "Product information only"}</span>
        </div>
      </div>
      <Link href={`/assets/${asset.slug}/`} className={styles.link} aria-label={`View ${asset.symbol} details`}>
        View details <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </article>
  );
}
