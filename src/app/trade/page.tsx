import type { Metadata } from "next";
import { TradeTool } from "@/components/TradeTool";
import { archiveAssets, catalogue } from "@/lib/catalogue";
import { assetMediaUrl } from "@/lib/catalogue-media";

export const metadata: Metadata = { title: "Trade", description: "Connect a Solana wallet and research a buy with current market references. Buying will be enabled when an execution service is connected." };

export default async function TradePage({ searchParams }: {searchParams:Promise<{asset?:string|string[];amount?:string|string[]}>}) {
  const params = await searchParams;
  const selected = Array.isArray(params.asset) ? params.asset[0] : params.asset;
  const amount = Array.isArray(params.amount) ? params.amount[0] : params.amount;
  const assets = archiveAssets.filter((asset) => asset.chain === "solana").map((asset) => ({slug:asset.slug,name:asset.name,symbol:asset.symbol,issuer:asset.issuer,address:asset.address,image:assetMediaUrl(asset),unitLabel:asset.unitLabel,perOz:asset.perOz,snapshotPrice:asset.priceUsd}));
  return <div className="container section"><div className="page-intro"><p className="eyebrow">Trade / Solana</p><h1>Your next real-world side.</h1><p>Choose an asset, connect your wallet and explore a buy. Market references are available now; buying is awaiting an execution connection.</p></div><TradeTool key={(selected ?? "")+":"+(amount ?? "")} assets={assets} initialSlug={selected} initialAmount={amount} snapshotAt={catalogue.snapshotAt}/></div>;
}
