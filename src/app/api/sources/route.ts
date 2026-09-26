import { catalogue, sourceGroups } from "@/lib/catalogue";
export function GET() { return Response.json({snapshotAt:catalogue.snapshotAt,mode:"archive",sources:sourceGroups}); }
