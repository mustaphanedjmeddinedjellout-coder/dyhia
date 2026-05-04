export type YalidineWilaya = {
  id: number;
  name: string;
};

export type YalidineCommune = {
  id: number;
  wilaya_id: number;
  name: string;
  wilaya_name?: string;
};

export type YalidineCenter = {
  center_id: number;
  name: string;
  commune_id: number;
  commune_name: string;
  wilaya_id: number;
  wilaya_name: string;
};

export type YalidineShippingQuote = {
  deliveryType: "home" | "stop";
  price: number;
  currency?: string;
  baseFee?: number;
  overweightFee?: number;
  billableWeightKg?: number;
};

export type YalidineCreateParcelInput = {
  orderId: string;
  fullName: string;
  phone: string;
  wilayaId: number;
  communeId: number;
  address: string;
  deliveryType: "home" | "stop";
  stopdeskId?: number;
  productName: string;
  codAmount: number;
  declaredValue?: number;
  notes?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  freeShipping?: boolean;
};

export type YalidineCreateParcelResult = {
  parcelId: string;
  tracking?: string;
  raw: unknown;
};

function getEnv(name: string) {
  return process.env[name] ?? "";
}

function joinPath(base: string, next: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const n = next.startsWith("/") ? next : `/${next}`;
  return `${b}${n}`;
}

function getNumberEnv(name: string): number | null {
  const raw = String(getEnv(name) || "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function getConfig() {
  const baseUrl = (getEnv("YALIDINE_API_BASE_URL") || "https://api.yalidine.app/v1").replace(
    /\/+$/,
    ""
  );

  // Official auth (preferred)
  const apiId = getEnv("YALIDINE_API_ID").trim();
  const apiToken = getEnv("YALIDINE_API_TOKEN").trim();

  // Legacy/custom auth (fallback)
  const headerName = (getEnv("YALIDINE_API_HEADER_NAME") || "Authorization").trim();
  const headerValue = String(getEnv("YALIDINE_API_HEADER_VALUE") || "").trim();

  const wilayasPath = getEnv("YALIDINE_WILAYAS_PATH") || "/wilayas/";
  const communesPath = getEnv("YALIDINE_COMMUNES_PATH") || "/communes/";
  const feesPath = getEnv("YALIDINE_FEES_PATH") || "/fees/";
  const centersPath = getEnv("YALIDINE_CENTERS_PATH") || "/centers/";
  const createParcelPath = getEnv("YALIDINE_CREATE_PARCEL_PATH") || "/parcels/";

  const fromWilayaId = getNumberEnv("YALIDINE_FROM_WILAYA_ID");
  const fromWilayaName = String(getEnv("YALIDINE_FROM_WILAYA_NAME") || "").trim();

  const defaultWeightKg = getNumberEnv("YALIDINE_DEFAULT_WEIGHT_KG") ?? 1;
  const defaultLengthCm = getNumberEnv("YALIDINE_DEFAULT_LENGTH_CM") ?? 30;
  const defaultWidthCm = getNumberEnv("YALIDINE_DEFAULT_WIDTH_CM") ?? 20;
  const defaultHeightCm = getNumberEnv("YALIDINE_DEFAULT_HEIGHT_CM") ?? 10;

  return {
    baseUrl,
    apiId,
    apiToken,
    headerName,
    headerValue,
    wilayasPath,
    communesPath,
    feesPath,
    centersPath,
    createParcelPath,
    fromWilayaId,
    fromWilayaName,
    defaultWeightKg,
    defaultLengthCm,
    defaultWidthCm,
    defaultHeightCm
  };
}

function assertConfigured() {
  const cfg = getConfig();
  if (!cfg.baseUrl) {
    throw new Error("Yalidine is not configured: missing YALIDINE_API_BASE_URL");
  }
  const hasOfficialAuth = !!(cfg.apiId && cfg.apiToken);
  const hasLegacyAuth = !!(cfg.headerName && cfg.headerValue);
  if (!hasOfficialAuth && !hasLegacyAuth) {
    throw new Error(
      "Yalidine is not configured: set YALIDINE_API_ID and YALIDINE_API_TOKEN (recommended)"
    );
  }
}

async function yalidineFetch<T>(
  path: string,
  options?: {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    cache?: RequestCache;
    next?: { revalidate?: number };
  }
): Promise<T> {
  assertConfigured();
  const cfg = getConfig();

  const url = new URL(cfg.baseUrl + path);
  for (const [key, value] of Object.entries(options?.query ?? {})) {
    if (value === undefined) {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  if (cfg.apiId && cfg.apiToken) {
    headers["X-API-ID"] = cfg.apiId;
    headers["X-API-TOKEN"] = cfg.apiToken;
  } else {
    headers[cfg.headerName] = cfg.headerValue;
  }

  const res = await fetch(url.toString(), {
    method: options?.method ?? (options?.body ? "POST" : "GET"),
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: options?.cache,
    next: options?.next
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Yalidine API error ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

/**
 * IMPORTANT: The exact response shapes vary by Yalidine API versions.
 * If your API returns a different shape, adjust the mapping logic here.
 */
export async function listYalidineWilayas(): Promise<YalidineWilaya[]> {
  const cfg = getConfig();
  const raw = await yalidineFetch<unknown>(cfg.wilayasPath, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 }
  });

  // Accept common shapes:
  // - [{ id, name }]
  // - { data: [{ id, name }] }
  const items = Array.isArray(raw)
    ? raw
    : typeof raw === "object" && raw && "data" in raw
      ? (raw as any).data
      : [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item: any) => ({
      id: Number(item.id ?? item.wilaya_id ?? item.code ?? item.value),
      name: String(item.name ?? item.label ?? item.wilaya_name ?? "").trim()
    }))
    .filter((w) => Number.isFinite(w.id) && w.id > 0 && w.name);
}

export async function listYalidineCommunes(wilayaId: number): Promise<YalidineCommune[]> {
  const cfg = getConfig();
  const raw = await yalidineFetch<unknown>(cfg.communesPath, {
    query: { wilaya_id: wilayaId },
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 }
  });

  const items = Array.isArray(raw)
    ? raw
    : typeof raw === "object" && raw && "data" in raw
      ? (raw as any).data
      : [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item: any) => ({
      id: Number(item.id ?? item.commune_id ?? item.code ?? item.value),
      wilaya_id: Number(item.wilaya_id ?? wilayaId),
      name: String(item.name ?? item.label ?? item.commune_name ?? "").trim(),
      wilaya_name: item.wilaya_name ? String(item.wilaya_name).trim() : undefined
    }))
    .filter((c) => Number.isFinite(c.id) && c.id > 0 && c.name);
}

export async function getYalidineWilayaById(wilayaId: number): Promise<YalidineWilaya | null> {
  const cfg = getConfig();
  const path = joinPath(cfg.wilayasPath, String(wilayaId));
  const raw = await yalidineFetch<any>(path, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 }
  });

  const obj =
    typeof raw === "object" && raw
      ? ("data" in raw ? raw.data : raw)
      : null;

  const id = obj ? Number(obj.id ?? wilayaId) : NaN;
  const name = obj ? String(obj.name ?? "").trim() : "";
  if (!Number.isFinite(id) || id <= 0 || !name) return null;
  return { id, name };
}

export async function getYalidineCommuneById(communeId: number): Promise<YalidineCommune | null> {
  const cfg = getConfig();
  const path = joinPath(cfg.communesPath, String(communeId));
  const raw = await yalidineFetch<any>(path, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 }
  });

  const obj =
    typeof raw === "object" && raw
      ? ("data" in raw ? raw.data : raw)
      : null;

  const id = obj ? Number(obj.id ?? communeId) : NaN;
  const wilaya_id = obj ? Number(obj.wilaya_id ?? 0) : NaN;
  const name = obj ? String(obj.name ?? "").trim() : "";
  const wilaya_name = obj?.wilaya_name ? String(obj.wilaya_name).trim() : undefined;

  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(wilaya_id) || wilaya_id <= 0 || !name) {
    return null;
  }
  return { id, wilaya_id, name, wilaya_name };
}

export async function listYalidineCentersByCommuneId(communeId: number): Promise<YalidineCenter[]> {
  const cfg = getConfig();
  const raw = await yalidineFetch<any>(cfg.centersPath, {
    query: { commune_id: communeId },
    cache: "no-store"
  });

  const items = Array.isArray(raw)
    ? raw
    : typeof raw === "object" && raw && "data" in raw
      ? raw.data
      : [];

  if (!Array.isArray(items)) return [];

  return items
    .map((item: any) => ({
      center_id: Number(item.center_id ?? item.id ?? item.centerId),
      name: String(item.name ?? "").trim(),
      commune_id: Number(item.commune_id ?? item.communeId ?? 0),
      commune_name: String(item.commune_name ?? "").trim(),
      wilaya_id: Number(item.wilaya_id ?? 0),
      wilaya_name: String(item.wilaya_name ?? "").trim()
    }))
    .filter((c: YalidineCenter) =>
      Number.isFinite(c.center_id) &&
      c.center_id > 0 &&
      c.name &&
      Number.isFinite(c.commune_id) &&
      c.commune_id > 0
    );
}

type YalidineFeesCommune = {
  commune_id: number;
  commune_name: string;
  express_home: number | null;
  express_desk: number | null;
  economic_home: number | null;
  economic_desk: number | null;
};

type YalidineFeesResponse = {
  from_wilaya_name?: string;
  to_wilaya_name?: string;
  zone?: number;
  retour_fee?: number;
  cod_percentage?: number;
  insurance_percentage?: number;
  oversize_fee?: number;
  per_commune?: Record<string, YalidineFeesCommune>;
};

export async function getYalidineFees(params: {
  fromWilayaId: number;
  toWilayaId: number;
}): Promise<YalidineFeesResponse> {
  const cfg = getConfig();
  return await yalidineFetch<YalidineFeesResponse>(cfg.feesPath, {
    query: {
      from_wilaya_id: params.fromWilayaId,
      to_wilaya_id: params.toWilayaId
    },
    cache: "no-store"
  });
}

function normalizePositiveNumber(n: unknown): number | null {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return null;
  return v;
}

function computeVolumetricWeightKg(dimensions: {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}) {
  return dimensions.lengthCm * dimensions.widthCm * dimensions.heightCm * 0.0002;
}

function computeBillableWeightKg(params: {
  actualWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}) {
  const volumetric = computeVolumetricWeightKg(params);
  return Math.max(params.actualWeightKg, volumetric);
}

function computeOverweightFee(params: {
  billableWeightKg: number;
  oversizeFee: number;
}) {
  if (!Number.isFinite(params.oversizeFee) || params.oversizeFee <= 0) return 0;
  if (params.billableWeightKg <= 5) return 0;
  const extraKg = Math.max(0, params.billableWeightKg - 5);
  return Math.ceil(extraKg) * params.oversizeFee;
}

export async function getYalidineShippingQuote(params: {
  toWilayaId: number;
  toCommuneId: number;
  deliveryType: "home" | "stop";
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}): Promise<YalidineShippingQuote | null> {
  const cfg = getConfig();
  const fromWilayaId = cfg.fromWilayaId;
  if (!fromWilayaId) {
    throw new Error("Yalidine is not configured: missing YALIDINE_FROM_WILAYA_ID");
  }

  const fees = await getYalidineFees({ fromWilayaId, toWilayaId: params.toWilayaId });
  const oversizeFee = Number(fees.oversize_fee ?? 0);

  const perCommune = fees.per_commune ?? {};
  const communeRow = perCommune[String(params.toCommuneId)];
  if (!communeRow) {
    return null;
  }

  const baseFee =
    params.deliveryType === "home"
      ? communeRow.express_home
      : communeRow.express_desk;

  if (baseFee === null || !Number.isFinite(Number(baseFee))) {
    return null;
  }

  const actualWeightKg =
    normalizePositiveNumber(params.weightKg) ?? cfg.defaultWeightKg;
  const lengthCm =
    normalizePositiveNumber(params.lengthCm) ?? cfg.defaultLengthCm;
  const widthCm =
    normalizePositiveNumber(params.widthCm) ?? cfg.defaultWidthCm;
  const heightCm =
    normalizePositiveNumber(params.heightCm) ?? cfg.defaultHeightCm;

  const billableWeightKg = computeBillableWeightKg({
    actualWeightKg,
    lengthCm,
    widthCm,
    heightCm
  });

  const overweightFee = computeOverweightFee({
    billableWeightKg,
    oversizeFee
  });

  const price = Number(baseFee) + overweightFee;
  if (!Number.isFinite(price)) return null;

  return {
    deliveryType: params.deliveryType,
    price,
    currency: "DZD",
    baseFee: Number(baseFee),
    overweightFee,
    billableWeightKg
  };
}

function splitFullName(fullName: string) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstname: "Client", familyname: "" };
  if (parts.length === 1) return { firstname: parts[0], familyname: "" };
  return { firstname: parts[0], familyname: parts.slice(1).join(" ") };
}

function normalizeYalidinePhone(phone: string) {
  const raw = String(phone || "").trim().replace(/\s+/g, "");
  if (!raw) return "";

  // Accept "+213XXXXXXXXX" and convert to "0XXXXXXXXX"
  if (raw.startsWith("+213")) {
    const rest = raw.slice(4);
    if (rest) return `0${rest}`;
  }

  // Accept "213XXXXXXXXX" and convert to "0XXXXXXXXX"
  if (raw.startsWith("213")) {
    const rest = raw.slice(3);
    if (rest) return `0${rest}`;
  }

  return raw;
}

export async function createYalidineParcel(
  input: YalidineCreateParcelInput
): Promise<YalidineCreateParcelResult> {
  const cfg = getConfig();

  if (!input.orderId) {
    throw new Error("Yalidine create parcel: missing orderId");
  }
  if (!cfg.fromWilayaId && !cfg.fromWilayaName) {
    throw new Error(
      "Yalidine create parcel: set YALIDINE_FROM_WILAYA_ID (recommended) or YALIDINE_FROM_WILAYA_NAME"
    );
  }

  const commune = await getYalidineCommuneById(input.communeId);
  if (!commune) {
    throw new Error("Yalidine create parcel: invalid commune_id");
  }

  const fromWilayaName = cfg.fromWilayaName
    ? cfg.fromWilayaName
    : cfg.fromWilayaId
      ? (await getYalidineWilayaById(cfg.fromWilayaId))?.name
      : undefined;

  if (!fromWilayaName) {
    throw new Error("Yalidine create parcel: could not resolve sender wilaya name");
  }

  const toWilayaName = commune.wilaya_name
    ? commune.wilaya_name
    : (await getYalidineWilayaById(commune.wilaya_id))?.name;

  if (!toWilayaName) {
    throw new Error("Yalidine create parcel: could not resolve destination wilaya name");
  }

  const { firstname, familyname } = splitFullName(input.fullName);
  const contact_phone = normalizeYalidinePhone(input.phone);

  const is_stopdesk = input.deliveryType === "stop";
  if (is_stopdesk && !input.stopdeskId) {
    throw new Error("Yalidine create parcel: stopdesk delivery requires stopdeskId");
  }

  const weight = normalizePositiveNumber(input.weightKg) ?? cfg.defaultWeightKg;
  const length = normalizePositiveNumber(input.lengthCm) ?? cfg.defaultLengthCm;
  const width = normalizePositiveNumber(input.widthCm) ?? cfg.defaultWidthCm;
  const height = normalizePositiveNumber(input.heightCm) ?? cfg.defaultHeightCm;

  const parcel = {
    order_id: input.orderId,
    from_wilaya_name: fromWilayaName,
    firstname,
    familyname,
    contact_phone,
    address: String(input.address || "").trim(),
    to_commune_name: commune.name,
    to_wilaya_name: toWilayaName,
    product_list: String(input.productName || "").trim(),
    price: Math.max(0, Math.floor(Number(input.codAmount) || 0)),
    do_insurance: true,
    declared_value: Math.max(
      0,
      Math.floor(Number(input.declaredValue ?? input.codAmount) || 0)
    ),
    height,
    width,
    length,
    weight,
    freeshipping: !!input.freeShipping,
    is_stopdesk,
    stopdesk_id: is_stopdesk ? input.stopdeskId : null,
    has_exchange: false,
    product_to_collect: null,
    ...(input.notes ? { notes: String(input.notes) } : {})
  };

  const raw = await yalidineFetch<any>(cfg.createParcelPath, {
    method: "POST",
    body: [parcel],
    cache: "no-store"
  });

  const entry = raw && typeof raw === "object" ? raw[input.orderId] : null;
  if (!entry || typeof entry !== "object") {
    throw new Error("Yalidine create parcel: unexpected response");
  }
  if (!entry.success) {
    throw new Error(String(entry.message || "Yalidine create parcel failed"));
  }

  const tracking = String(entry.tracking || "").trim();
  if (!tracking) {
    throw new Error("Yalidine create parcel: missing tracking in response");
  }

  return { parcelId: tracking, tracking, raw };
}
