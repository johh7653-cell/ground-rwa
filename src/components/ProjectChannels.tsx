"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { project } from "@/lib/project";

export function ProjectContractAddress({ className = "" }: { className?: string }) {
  const [feedback, setFeedback] = useState("");

  async function copyAddress() {
    if (!project.contractAddress) return;
    try {
      await navigator.clipboard.writeText(project.contractAddress);
      setFeedback("Address copied.");
    } catch {
      setFeedback("Copy unavailable. Select and copy the address manually.");
    }
  }

  return (
    <div className={`project-address ${className}`} role="group" aria-label="GROUND Solana contract address">
      <span>Solana CA</span>
      <code>{project.contractAddress || "TBA"}</code>
      {project.contractAddress ? <button type="button" onClick={copyAddress} aria-label="Copy contract address"><Copy size={16} aria-hidden="true" /></button> : null}
      <span className="note contract-feedback" role="status">{feedback}</span>
    </div>
  );
}

export function ProjectChannels() {
  const links = [
    { label: "X", url: project.xUrl },
    { label: "GitHub", url: project.githubUrl },
    { label: "Explorer", url: project.explorerUrl },
    { label: "Buy", url: project.buyUrl },
  ].filter((item) => /^https:\/\//.test(item.url));

  return (
    <div className="project-channels">
      <ProjectContractAddress />
      <div className="project-link-list">{links.map((item) => <a href={item.url} key={item.label} target="_blank" rel="noopener noreferrer">{item.label}</a>)}</div>
    </div>
  );
}
