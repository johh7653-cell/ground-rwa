import Link from "next/link";
import { Layers3 } from "lucide-react";
import { ProjectChannels } from "./ProjectChannels";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Link href="/" className="wordmark"><Layers3 size={24} strokeWidth={1.7} aria-hidden="true" /><span>GROUND</span></Link>
            <p>A real-world side to your Solana wallet.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/trade/">Trade</Link>
            <Link href="/watchlist/">Watchlist</Link>
            <Link href="/assets/?network=all">All assets</Link>
            <Link href="/markets/">Markets</Link>
            <Link href="/issuers/">Issuers</Link>
            <Link href="/sources/">Data sources</Link>
            <Link href="/blueprint/">My blueprint</Link>
            <Link href="/basket/">Asset basket</Link>
            <Link href="/swap/">Compare</Link>
            <Link href="/draw/">Discover</Link>
            <Link href="/account/">Workspace</Link>
            <Link href="/stats/">Statistics</Link>
            <Link href="/docs/">Docs</Link>
            <Link href="/thesis/">Thesis</Link>
            <Link href="/approach/">Our approach</Link>
          </nav>
        </div>
        <ProjectChannels />
        <div className="footer-bottom">
          <span>Market references &amp; planning. Buying is not connected yet.</span>
          <span>GROUND does not issue the assets in this catalogue.</span>
        </div>
      </div>
    </footer>
  );
}
