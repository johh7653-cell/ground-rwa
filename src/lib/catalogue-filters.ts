export interface CatalogueFilters {
  q: string;
  category: string;
  network: string;
  issuer: string;
  source: string;
  coverage: "all" | "priced" | "unpriced" | "probe";
  sort: "catalogue" | "name" | "liquidity" | "price";
  view: "list" | "grid";
  page: number;
}
export interface CatalogueFilterOptions { categories: string[]; networks: string[]; issuers: string[]; sources: string[]; defaultNetwork?: string; }

export function defaultCatalogueFilters(network = "solana"): CatalogueFilters {
  return { q: "", category: "all", network, issuer: "all", source: "all", coverage: "all", sort: "catalogue", view: "list", page: 1 };
}

export function readCatalogueFilters(params: URLSearchParams, options: CatalogueFilterOptions): CatalogueFilters {
  const aliases: Record<string, string> = { companies: "equities", indices: "etfs", gold: "precious-metals" };
  const requestedCategory = params.get("category") ?? "all";
  const category = aliases[requestedCategory] ?? requestedCategory;
  const network = params.get("network") ?? options.defaultNetwork ?? "solana";
  const issuer = params.get("issuer") ?? "all";
  const source = params.get("source") ?? "all";
  const coverage = params.get("coverage");
  const sort = params.get("sort");
  const pageString = params.get("page") ?? "1";
  const page = /^\d+$/.test(pageString) ? Number(pageString) : 1;
  return {
    q: params.get("q") ?? "",
    category: category === "all" || options.categories.includes(category) ? category : "all",
    network: network === "all" || options.networks.includes(network) ? network : options.defaultNetwork ?? "solana",
    issuer: issuer === "all" || options.issuers.includes(issuer) ? issuer : "all",
    source: source === "all" || options.sources.includes(source) ? source : "all",
    coverage: coverage === "priced" || coverage === "unpriced" || coverage === "probe" ? coverage : "all",
    sort: sort === "name" || sort === "liquidity" || sort === "price" ? sort : "catalogue",
    view: params.get("view") === "grid" ? "grid" : "list",
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
  };
}

export function serializeCatalogueFilters(filters: CatalogueFilters): string {
  const params = new URLSearchParams();
  params.set("network", filters.network);
  if (filters.q) params.set("q", filters.q);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.issuer !== "all") params.set("issuer", filters.issuer);
  if (filters.source !== "all") params.set("source", filters.source);
  if (filters.coverage !== "all") params.set("coverage", filters.coverage);
  if (filters.sort !== "catalogue") params.set("sort", filters.sort);
  if (filters.view !== "list") params.set("view", filters.view);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function searchParamsFromRecord(record: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return params;
}
