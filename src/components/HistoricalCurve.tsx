"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { type HistoricalCurveData, formatSnapshotTime, formatUsd } from "@/lib/assets";
import styles from "./HistoricalCurve.module.css";

export function HistoricalCurve({ data, symbol }: { data: HistoricalCurveData; symbol: string }) {
  const controlId = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const validPoints = data.points.filter((point) => point.filled && point.impact !== null && Number.isFinite(point.impact));
  const point = validPoints[selectedIndex];
  if (!point || validPoints.length < 2) {
    return <p className="note">No usable historical price-impact samples were saved for this product.</p>;
  }

  const width = 720;
  const height = 258;
  const left = 53;
  const right = 33;
  const top = 19;
  const bottom = 44;
  const minLog = Math.log10(validPoints[0].sizeUsd);
  const maxLog = Math.log10(validPoints[validPoints.length - 1].sizeUsd);
  const maximumPercent = Math.max(...validPoints.map((sample) => sample.impact! * 100));
  const maximumY = maximumPercent <= 1 ? 1 : maximumPercent <= 5 ? Math.ceil(maximumPercent) : Math.ceil(maximumPercent / 10) * 10;
  const x = (value: number) => left + ((Math.log10(value) - minLog) / (maxLog - minLog)) * (width - left - right);
  const y = (value: number) => top + (1 - (value * 100) / maximumY) * (height - top - bottom);
  const polyline = validPoints.map((sample) => `${x(sample.sizeUsd)},${y(sample.impact!)}`).join(" ");
  const labelIndices = [...new Set([0, Math.floor((validPoints.length - 1) / 2), validPoints.length - 1])];

  function shortUsd(value: number) {
    return `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 }).format(value)}`;
  }

  return (
    <section className={styles.panel} aria-labelledby={`${controlId}-heading`}>
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>Historical samples</p>
          <h2 id={`${controlId}-heading`}>A past view of price impact.</h2>
        </div>
        <span className={styles.date}><time dateTime={data.observedAt}>{formatSnapshotTime(data.observedAt)}</time></span>
      </div>
      <p className={styles.description}>These saved {symbol} probe observations relate order size to quoted price impact. They are separate from price performance.</p>

      <div className={styles.controls}>
        <div>
          <label htmlFor={`${controlId}-size`}>Saved order size</label>
          <div className={styles.select}>
            <select id={`${controlId}-size`} value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))}>
              {validPoints.map((sample, index) => <option key={sample.sizeUsd} value={index}>{formatUsd(sample.sizeUsd)}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.reading} aria-live="polite" aria-atomic="true">
          <span>Impact at that saved size</span>
          <strong>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(point.impact! * 100)}%</strong>
        </div>
      </div>

      <div className={styles.chart}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${controlId}-chart-title ${controlId}-chart-description`}>
          <title id={`${controlId}-chart-title`}>{symbol}: historical order-size and price-impact samples</title>
          <desc id={`${controlId}-chart-description`}>Saved {data.engine} probe samples from {formatSnapshotTime(data.observedAt)}. Order sizes use a logarithmic horizontal scale. Connecting lines are visual guides, not additional quotes.</desc>
          {[0, 1, 2, 3, 4].map((index) => {
            const percentage = (maximumY * index) / 4;
            const positionY = y(percentage / 100);
            return <g key={index}>
              <line x1={left} x2={width - right} y1={positionY} y2={positionY} className={styles.gridLine} />
              <text x={left - 11} y={positionY + 4} textAnchor="end" className={styles.axisText}>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(percentage)}%</text>
            </g>;
          })}
          <polyline points={polyline} className={styles.curve} />
          {validPoints.map((sample, index) => <circle key={sample.sizeUsd} cx={x(sample.sizeUsd)} cy={y(sample.impact!)} r={index === selectedIndex ? 5 : 3} className={index === selectedIndex ? styles.selectedPoint : styles.point} />)}
          {labelIndices.map((index) => <text key={index} x={x(validPoints[index].sizeUsd)} y={height - 20} textAnchor={index === 0 ? "start" : index === validPoints.length - 1 ? "end" : "middle"} className={styles.axisText}>{shortUsd(validPoints[index].sizeUsd)}</text>)}
        </svg>
      </div>
      <p className={styles.axisNote}>Order size in USD · logarithmic scale</p>
      <p className={styles.note}>Saved samples only. Lines connect observations; values between them are not quotes. No current route, execution or sell capacity is established by this chart.</p>
      <details className={styles.tableDisclosure}>
        <summary>Read the saved sample values</summary>
        <div className={styles.tableWrapper}>
          <table>
            <caption className={styles.srOnly}>Historical samples for {symbol}</caption>
            <thead><tr><th scope="col">Order size</th><th scope="col">Saved impact</th></tr></thead>
            <tbody>{validPoints.map((sample) => <tr key={sample.sizeUsd}><th scope="row">{formatUsd(sample.sizeUsd)}</th><td>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(sample.impact! * 100)}%</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
