"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { project } from "@/lib/project";
import { WalletButton } from "./WalletButton";

const navigation = [
  { href: "/trade/", label: "Trade" },
  { href: "/assets/", label: "Assets" },
  { href: "/markets/", label: "Markets" },
  { href: "/issuers/", label: "Issuers" },
];
const tools = [{href:"/watchlist/",label:"My watchlist"},{href:"/blueprint/",label:"My blueprint"},{href:"/basket/",label:"Asset basket"},{href:"/swap/",label:"Asset comparison"},{href:"/draw/",label:"Random discovery"},{href:"/account/",label:"My workspace"}];
const library = [{href:"/sources/",label:"Data sources"},{href:"/stats/",label:"Coverage & statistics"},{href:"/docs/",label:"Documentation"},{href:"/thesis/",label:"The GROUND thesis"},{href:"/approach/",label:"Our approach"}];
const socialLinks = [
  { href: project.xUrl, label: "X", name: "Open X (Twitter)" },
  { href: project.githubUrl, label: "GitHub", name: "GROUND on GitHub" },
].filter((item) => /^https:\/\//.test(item.href));

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  function closeNavigation() { setOpen(false); setDropdown(null); }
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="wordmark" aria-label={`${project.name} home`} onClick={closeNavigation}>
          <Image src="/ground-logo.png" className="brand-mark" width={29} height={29} alt="" aria-hidden="true" />
          <span>{project.name}</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeNavigation} className={pathname.startsWith(item.href.replace(/\/$/, "")) ? "active" : ""}>
              {item.label}
            </Link>
          ))}
          {[{id:"tools",label:"Tools",items:tools},{id:"library",label:"Library",items:library}].map((group) => <div className="nav-group" key={group.id} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdown(null); }} onKeyDown={(event) => { if(event.key === "Escape") { setDropdown(null); event.currentTarget.querySelector("button")?.focus(); } }}><button type="button" aria-expanded={dropdown === group.id} aria-controls={"nav-" + group.id} onClick={() => setDropdown(dropdown === group.id ? null : group.id)} onKeyDown={(event) => { if(event.key === "Escape") setDropdown(null); }}>{group.label}<ChevronDown size={13} aria-hidden="true" /></button>{dropdown === group.id ? <div className="nav-dropdown" id={"nav-" + group.id}>{group.items.map((item) => <Link key={item.href} href={item.href} onClick={closeNavigation}>{item.label}</Link>)}</div> : null}</div>)}
        </nav>
        <nav className="header-social-links" aria-label="Project links">
          {socialLinks.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} (opens in a new tab)`} title={item.name}>{item.label}</a>)}
        </nav>
        <div className="wallet-placement"><WalletButton/></div>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav container" aria-label="Mobile navigation">
          {[...navigation,...tools,...library].map((item) => <Link key={item.href} href={item.href} onClick={closeNavigation}>{item.label}</Link>)}
          <div className="mobile-social-links">
            {socialLinks.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} (opens in a new tab)`} onClick={closeNavigation}>{item.label === "X" ? "X / Twitter" : item.label}</a>)}
          </div>
        </nav>
      )}
    </header>
  );
}
