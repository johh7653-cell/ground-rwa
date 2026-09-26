import Link from "next/link";
import { ArrowRight, Building2, ChartNoAxesCombined, Gem, Landmark } from "lucide-react";
import { AssetExplorer } from "@/components/AssetExplorer";
import { Blueprint, BlueprintPreview } from "@/components/Blueprint";
import { RightsAccordion } from "@/components/RightsAccordion";
import { ProjectContractCard } from "@/components/ProjectContractCard";
import { categories } from "@/lib/assets";
import { getArchivedAsset, networkLabel } from "@/lib/catalogue";
import { assetMediaUrl } from "@/lib/catalogue-media";
import { CatalogueHome, CatalogueCategoryLinks, CatalogueSnapshotBar } from "@/components/CatalogueHome";
import { AssetBudgetCalculator } from "@/components/AssetBudgetCalculator";
import { unitPrice } from "@/lib/catalogue-tools";

const icons = { companies: Building2, indices: ChartNoAxesCombined, gold: Gem, treasuries: Landmark };

export default function HomePage() {
  const budgetReferences = ["aaplx","tslax","spyx","gldx","usdy","xaut"].map(getArchivedAsset).filter((asset) => asset !== undefined).map((asset) => ({slug:asset.slug,symbol:asset.symbol,name:asset.name,price:unitPrice(asset),network:networkLabel(asset.chain),unit:asset.unitLabel,image:assetMediaUrl(asset)}));
  return <>
    <div className="container contract-section"><ProjectContractCard /></div>
    <section className="hero container">
      <div className="hero-copy">
        <p className="hero-label">Real-world assets on Solana</p>
        <h1><span>Your wallet.</span><span>A real-world side.</span></h1>
        <p className="hero-description">Explore tokenized assets. Give each part of your wallet a purpose.</p>
        <div className="hero-actions"><Link className="button primary" href="/assets/">Explore assets <ArrowRight size={18} /></Link><Link className="button secondary" href="/blueprint/">Build my blueprint</Link></div>
      </div>
      <BlueprintPreview />
    </section>

    <CatalogueSnapshotBar />
    <AssetBudgetCalculator references={budgetReferences} />

    <section className="discovery section container" id="assets">
      <div className="section-title"><h2>Find your real-world side.</h2><p>Explore assets by the part of the world they represent.</p></div>
      <div className="category-grid">
        {categories.map((category) => {
          const Icon = icons[category.id];
          return <Link href={`/assets/?network=all&category=${category.id}`} className={`category-card category-${category.id}`} key={category.id}>
            <div className="category-card-top"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /><ArrowRight size={17} aria-hidden="true" /></div>
            <h3>{category.shortName}</h3><p>{category.description}</p>
          </Link>;
        })}
      </div>
      <CatalogueCategoryLinks />
      <div className="featured-heading"><h3>A few places to start.</h3><Link href="/assets/?network=all" className="text-link">View all assets <ArrowRight size={16} /></Link></div>
      <AssetExplorer featured />
    </section>

    <CatalogueHome />

    <section className="section blueprint-section container" id="blueprint">
      <div className="section-title"><h2>A blueprint, built by you.</h2><p>Set a sample budget. Shape your own allocation.</p></div>
      <Blueprint />
    </section>

    <section className="section approach-section container" id="approach">
      <div className="section-title"><h2>Know what you hold.</h2><p>Three questions before you choose an asset.</p></div>
      <RightsAccordion />
      <Link href="/approach/" className="text-link approach-action">Read our approach <ArrowRight size={18} /></Link>
    </section>
  </>;
}
