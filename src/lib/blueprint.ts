import type { CategoryId } from "./assets";

export const BLUEPRINT_CATEGORY_IDS: CategoryId[] = ["indices", "companies", "gold", "treasuries"];
export const MAX_BUDGET_USD = 10_000_000;
export const BLUEPRINT_STORAGE_KEY = "ground:blueprint:v1";
export const DEFAULT_WEIGHTS: Record<CategoryId, number> = { indices: 40, companies: 25, gold: 20, treasuries: 15 };
export const CATEGORY_COLORS: Record<CategoryId, string> = { indices: "var(--accent)", companies: "#69757b", gold: "#a1a9ae", treasuries: "#d5dbd8" };

export interface BlueprintDraft {
  budget: string;
  weights: Record<CategoryId, string>;
  references: Partial<Record<CategoryId, string>>;
}

export interface SavedBlueprint {
  version: 1;
  budgetUsd: number;
  weights: Record<CategoryId, number>;
  references: Partial<Record<CategoryId, string>>;
}

export function createDefaultDraft(): BlueprintDraft {
  return { budget: "1000", weights: { indices: "40", companies: "25", gold: "20", treasuries: "15" }, references: {} };
}

export function parseBudget(value: string): number | null {
  const trimmed = value.trim();
  if (!/^(?:\d+|\d*\.\d{1,2})$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0.01 && parsed <= MAX_BUDGET_USD ? parsed : null;
}

export function parseWeight(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
}

export function evaluateDraft(draft: BlueprintDraft) {
  const budget = parseBudget(draft.budget);
  const budgetError = budget === null ? "Enter a budget from $0.01 to $10,000,000, using up to two decimal places." : null;
  const weights = Object.fromEntries(BLUEPRINT_CATEGORY_IDS.map((id) => [id, parseWeight(draft.weights[id])])) as Record<CategoryId, number | null>;
  const weightErrors = Object.fromEntries(BLUEPRINT_CATEGORY_IDS.map((id) => [id, weights[id] === null ? "Enter a whole percentage from 0 to 100." : null])) as Record<CategoryId, string | null>;
  const total = BLUEPRINT_CATEGORY_IDS.every((id) => weights[id] !== null) ? BLUEPRINT_CATEGORY_IDS.reduce((sum, id) => sum + weights[id]!, 0) : null;
  const status = total === null ? "invalid" : total === 0 ? "empty" : total < 100 ? "under" : total > 100 ? "over" : "complete";
  return { budget, budgetError, weights, weightErrors, total, status, isValid: budget !== null && status === "complete" };
}

export function allocationGradient(weights: Record<CategoryId, number | null>, total: number | null): string {
  if (total === null || total === 0 || total > 100 || BLUEPRINT_CATEGORY_IDS.some((id) => weights[id] === null || weights[id]! < 0 || weights[id]! > 100)) return "var(--line)";
  let position = 0;
  const stops = BLUEPRINT_CATEGORY_IDS.map((id) => {
    const start = position;
    position += weights[id]!;
    return `${CATEGORY_COLORS[id]} ${start}% ${position}%`;
  });
  if (total < 100) stops.push(`var(--line) ${position}% 100%`);
  return `conic-gradient(${stops.join(", ")})`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type ReferenceValidator = (categoryId: CategoryId, slug: string) => boolean;

export function decodeSavedBlueprint(raw: string, validReference: ReferenceValidator): SavedBlueprint | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!isRecord(value) || value.version !== 1 || typeof value.budgetUsd !== "number" || !Number.isFinite(value.budgetUsd) || parseBudget(String(value.budgetUsd)) === null || !isRecord(value.weights) || !isRecord(value.references)) return null;
  if (Object.keys(value.weights).length !== BLUEPRINT_CATEGORY_IDS.length || Object.keys(value.weights).some((key) => !BLUEPRINT_CATEGORY_IDS.includes(key as CategoryId))) return null;
  const weights: SavedBlueprint["weights"] = { companies: 0, indices: 0, gold: 0, treasuries: 0 };
  for (const id of BLUEPRINT_CATEGORY_IDS) {
    const weight = value.weights[id];
    if (typeof weight !== "number" || !Number.isInteger(weight) || weight < 0 || weight > 100) return null;
    weights[id] = weight;
  }
  if (BLUEPRINT_CATEGORY_IDS.reduce((sum, id) => sum + weights[id], 0) !== 100) return null;
  const references: SavedBlueprint["references"] = {};
  for (const [key, slug] of Object.entries(value.references)) {
    if (!BLUEPRINT_CATEGORY_IDS.includes(key as CategoryId) || typeof slug !== "string" || !validReference(key as CategoryId, slug)) return null;
    references[key as CategoryId] = slug;
  }
  return { version: 1, budgetUsd: value.budgetUsd, weights, references };
}

export function savedToDraft(saved: SavedBlueprint): BlueprintDraft {
  return { budget: String(saved.budgetUsd), weights: Object.fromEntries(BLUEPRINT_CATEGORY_IDS.map((id) => [id, String(saved.weights[id])])) as BlueprintDraft["weights"], references: { ...saved.references } };
}

export function prepareSavedBlueprint(draft: BlueprintDraft, validReference: ReferenceValidator): SavedBlueprint | null {
  const evaluation = evaluateDraft(draft);
  if (!evaluation.isValid) return null;
  const candidate: SavedBlueprint = { version: 1, budgetUsd: evaluation.budget!, weights: evaluation.weights as SavedBlueprint["weights"], references: { ...draft.references } };
  return decodeSavedBlueprint(JSON.stringify(candidate), validReference);
}
