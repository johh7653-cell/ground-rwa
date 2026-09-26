import { archiveIssuers, catalogue } from "@/lib/catalogue";
export function GET() { return Response.json({snapshotAt:catalogue.snapshotAt,mode:"archive",issuers:archiveIssuers}); }
