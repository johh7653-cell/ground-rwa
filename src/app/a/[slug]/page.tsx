import { redirect } from "next/navigation";
export default async function LegacyAssetPage({ params }: {params:Promise<{slug:string}>}) {
  const {slug} = await params;
  redirect("/assets/" + encodeURIComponent(slug) + "/");
}
