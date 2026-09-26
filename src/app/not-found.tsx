import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <section className="container empty-page"><h1>That page is not here.</h1><p>Explore the assets in our current catalogue.</p><Link className="button primary" href="/assets/"><ArrowLeft size={18} /> Back to assets</Link></section>;
}
