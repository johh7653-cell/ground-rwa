import { catalogue, getArchivedAsset } from "@/lib/catalogue";
export async function GET(_request: Request, {params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params;
  const asset = getArchivedAsset(slug);
  if(!asset) return Response.json({error:"Asset not found"},{status:404});
  return Response.json({snapshotAt:catalogue.snapshotAt,mode:"archive",asset});
}
