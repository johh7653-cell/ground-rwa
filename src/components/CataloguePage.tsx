import Link from "next/link";
import { ArrowUpRight, Database } from "lucide-react";
import { catalogue } from "@/lib/catalogue";
import styles from "./CatalogueDirectory.module.css";

const sections = [
  { href: "/markets/", label: "Markets" },
  { href: "/issuers/", label: "Issuers" },
  { href: "/sources/", label: "Data sources" },
  { href: "/stats/", label: "Catalogue stats" },
];

export function archiveDate(value = catalogue.snapshotAt) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(value)) + " UTC";
}

export function catalogueHref(filters: Record<string, string> = {}) {
  return `/assets/?${new URLSearchParams({ network: "all", ...filters }).toString()}`;
}

export function CataloguePageIntro({ active, title, children }: { active: string; title: string; children: React.ReactNode }) {
  return <>
    <div className="page-intro">
      <span className="inline-label"><Database size={15} aria-hidden="true" /> Catalogue archive</span>
      <h1>{title}</h1>
      <p>{children}</p>
      <p className={styles.snapshot}><time dateTime={catalogue.snapshotAt}>Snapshot · {archiveDate()}</time></p>
    </div>
    <nav className={styles.directoryNav} aria-label="Catalogue sections">
      {sections.map((item) => <Link key={item.href} href={item.href} className={item.href === active ? styles.activeNav : ""} aria-current={item.href === active ? "page" : undefined}>{item.label}</Link>)}
      <Link href={catalogueHref()} className={styles.browseAll}>All assets <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </nav>
  </>;
}

export function DirectoryMetrics({ metrics }: { metrics: { label: string; value: string | number; note?: string }[] }) {
  return <dl className={styles.metrics}>{metrics.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{typeof item.value === "number" ? item.value.toLocaleString("en-US") : item.value}</dd>{item.note ? <small>{item.note}</small> : null}</div>)}</dl>;
}

export function CatalogueFootnote() {
  return <p className={styles.footnote}>The archive preserves third-party product and market records. Dates, missing fields and source labels stay visible. Network coverage, a source link or an archived route count does not establish current trading availability or a GROUND partnership.</p>;
}
