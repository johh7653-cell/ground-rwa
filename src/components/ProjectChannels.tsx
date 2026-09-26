"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { project } from "@/lib/project";

export function ProjectChannels() {
  const [feedback, setFeedback] = useState("");
  const links = [
    { label: "X", url: project.xUrl },
    { label: "GitHub", url: project.githubUrl },
    { label: "Explorer", url: project.explorerUrl },
    { label: "Buy", url: project.buyUrl },
  ].filter((item) => /^https:\/\//.test(item.url));

  if (!project.contractAddress && links.length === 0) return null;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(project.contractAddress);
      setFeedback("Address copied.");
    } catch {
      setFeedback("Copy unavailable. Select and copy the address manually.");
    }
  }

  return (
    <div className="project-channels">
      {project.contractAddress && <div className="project-address"><span>Solana contract address</span><code>{project.contractAddress}</code><button onClick={copyAddress} aria-label="Copy contract address"><Copy size={16} /></button></div>}
      <div className="project-link-list">{links.map((item) => <a href={item.url} key={item.label} target="_blank" rel="noopener noreferrer">{item.label}</a>)}</div>
      <span className="note" role="status">{feedback}</span>
    </div>
  );
}
