import test from "node:test";
import assert from "node:assert/strict";
import { allocationGradient, createDefaultDraft, decodeSavedBlueprint, evaluateDraft, parseBudget, parseWeight, prepareSavedBlueprint, savedToDraft } from "./blueprint.ts";

const validReference = (category, slug) => category === "indices" && slug === "spyx";

test("budgets reject empty, non-finite, negative, zero, excessive and fractional-cent amounts", () => {
  for (const value of ["", " ", "NaN", "Infinity", "-10", "0", "10000001", "100.001", "1e3"]) assert.equal(parseBudget(value), null, value);
  assert.equal(parseBudget("0.01"), 0.01);
  assert.equal(parseBudget("10000000"), 10000000);
  assert.equal(parseBudget("1250.50"), 1250.5);
});

test("weights reject invalid values without silently rounding or clamping", () => {
  for (const value of ["", "NaN", "-1", "101", "20.5"]) assert.equal(parseWeight(value), null, value);
  assert.equal(parseWeight("0"), 0);
  assert.equal(parseWeight("100"), 100);
});

test("allocation state preserves under, over and zero totals and prevents saving", () => {
  const draft = createDefaultDraft();
  assert.equal(evaluateDraft(draft).isValid, true);
  draft.weights.indices = "30";
  assert.deepEqual([evaluateDraft(draft).status, evaluateDraft(draft).total, evaluateDraft(draft).isValid], ["under", 90, false]);
  draft.weights.indices = "50";
  assert.deepEqual([evaluateDraft(draft).status, evaluateDraft(draft).total, evaluateDraft(draft).isValid], ["over", 110, false]);
  draft.weights = { companies: "0", indices: "0", gold: "0", treasuries: "0" };
  assert.equal(evaluateDraft(draft).status, "empty");
  assert.equal(prepareSavedBlueprint(draft, validReference), null);
  draft.weights.indices = "";
  assert.equal(evaluateDraft(draft).total, null);
});

test("under-allocation chart includes the unassigned share and over-allocation does not normalize", () => {
  const under = evaluateDraft({ ...createDefaultDraft(), weights: { indices: "30", companies: "25", gold: "20", treasuries: "15" } });
  assert.match(allocationGradient(under.weights, under.total), /var\(--line\) 90% 100%/);
  const over = evaluateDraft({ ...createDefaultDraft(), weights: { indices: "50", companies: "25", gold: "20", treasuries: "15" } });
  assert.equal(allocationGradient(over.weights, over.total), "var(--line)");
});

test("valid versioned snapshots round-trip budget, weights and reference selections", () => {
  const draft = createDefaultDraft();
  draft.budget = "2500.50";
  draft.references.indices = "spyx";
  const saved = prepareSavedBlueprint(draft, validReference);
  assert.ok(saved);
  assert.equal(saved.version, 1);
  assert.deepEqual(savedToDraft(decodeSavedBlueprint(JSON.stringify(saved), validReference)), { ...draft, budget: "2500.5" });
});

test("stored records reject unsupported versions, broken shape, unknown or mismatched products and invalid totals", () => {
  const good = prepareSavedBlueprint(createDefaultDraft(), validReference);
  for (const raw of ["{", "null", "[]", JSON.stringify({ ...good, version: 2 }), JSON.stringify({ ...good, budgetUsd: -1 }), JSON.stringify({ ...good, weights: { ...good.weights, indices: 39 } }), JSON.stringify({ ...good, weights: { ...good.weights, extra: 0 } }), JSON.stringify({ ...good, references: { companies: "spyx" } }), JSON.stringify({ ...good, references: { indices: "unknown" } }), JSON.stringify({ ...good, references: { fake: "spyx" } })]) assert.equal(decodeSavedBlueprint(raw, validReference), null, raw);
});
