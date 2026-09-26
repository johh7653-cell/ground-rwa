"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { project } from "@/lib/project";

export function ProjectContractAddress({ className = "" }: { className?: string }) {
  const [feedback, setFeedback] = useState("");
  const address = project.contractAddress.trim();

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setFeedback("Address copied.");
    } catch {
      setFeedback("Copy unavailable. Select and copy the address manually.");
    }
  }

  return (
    <div className={`project-address ${className}`} role="group" aria-label="GROUND Solana contract address">
      <span>Solana CA</span>
      <code>{address || "TBA"}</code>
      {address ? <button type="button" onClick={copyAddress} aria-label="Copy contract address"><Copy size={16} aria-hidden="true" /></button> : null}
      <span className="note contract-feedback" role="status">{feedback}</span>
    </div>
  );
}

export function ProjectChannels() {
  const links = [
    { label: "X", url: project.xUrl, requiresAddress: false },
    { label: "GitHub", url: project.githubUrl, requiresAddress: false },
    { label: "Explorer", url: project.explorerUrl, requiresAddress: true },
    { label: "Buy", url: project.buyUrl, requiresAddress: true },
  ].filter((item) => /^https:\/\//.test(item.url) && (!item.requiresAddress || Boolean(project.contractAddress.trim())));

  return (
    <div className="project-channels">
      <ProjectContractAddress />
      <div className="project-link-list">{links.map((item) => <a href={item.url} key={item.label} target="_blank" rel="noopener noreferrer">{item.label}</a>)}</div>
    </div>
  );
}
