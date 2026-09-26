import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, CircleHelp } from "lucide-react";
import { RightsAccordion } from "@/components/RightsAccordion";

export const metadata: Metadata = { title: "Our approach" };

const sources = [
  { name: "Solana Foundation", label: "The real-world asset ecosystem", url: "https://solana.com/news/overview-of-institutional-real-world-assets-on-solana" },
  { name: "xStocks", label: "Product structure and holder rights", url: "https://docs.xstocks.fi/docs/frequently-asked-questions" },
  { name: "Ondo Finance", label: "USDY product and eligibility", url: "https://ondo.finance/usdy" },
  { name: "Matrixdock", label: "XAUm gold product information", url: "https://www.matrixdock.com/xaum" },
];

export default function ApproachPage() {
  return <div className="container approach-page">
    <div className="page-intro"><span className="inline-label"><CircleHelp size={16} /> Our approach</span><h1>Understand the asset.<br />Then the token.</h1><p>We organize third-party asset tokens by what they represent, who issues them, and how their holders can use them.</p></div>
    <RightsAccordion />
    <section className="approach-method section">
      <h2>Every asset needs context.</h2>
      <div className="method-grid">
        <div><span>Identity</span><h3>The product and its issuer</h3><p>A symbol alone tells you very little. Product names, underlying exposure and the issuer’s own information belong together.</p></div>
        <div><span>Structure</span><h3>The rights behind a token</h3><p>Gold-linked products, equity tracker certificates and Treasury-linked notes are different instruments. Their rights are described individually.</p></div>
        <div><span>Access</span><h3>Conditions before action</h3><p>Being on Solana does not make a product accessible to every wallet. Entry, transfers and issuer redemption can follow different rules.</p></div>
        <div><span>Freshness</span><h3>A date beside every price</h3><p>Saved prices are dated historical observations. Missing prices stay unavailable. They are never shown as live executable quotes.</p></div>
      </div>
    </section>
    <section className="source-section" id="sources"><div className="section-title"><h2>Start at the source.</h2><p>Official product information, not partnerships or integrations.</p></div><div className="sources-grid">{sources.map((source) => <a href={source.url} key={source.name} target="_blank" rel="noopener noreferrer"><BookOpen size={20} aria-hidden="true" /><span><strong>{source.name}</strong><small>{source.label}</small></span><ArrowUpRight size={18} aria-hidden="true" /></a>)}</div></section>
    <div className="research-note"><h3>About this preview</h3><p>Blueprint and baskets are local planning tools. Wallet connection reads your public Solana account; market data can be fetched from the source. GROUND does not issue the listed assets, execute buys yet, or promise returns. Any future GROUND community token is separate from these third-party assets and their backing.</p></div>
  </div>;
}
