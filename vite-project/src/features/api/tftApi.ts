import type {
  Champion,
  ChampionMeta,
  Cost,
} from "../domain/champion";
import type { ChampionCombatStats } from "../domain/championCombatStats";
import type {
  ChampionRoleEvidence,
  UnifiedChampionRole,
} from "../domain/championRole";
import type {
  OpEvaluationIndex,
  OpEvaluationResult,
  StaticPowerResult,
} from "../domain/staticPower";

export const TFT_DATASET_SCHEMA_VERSION = 1;

export interface TFTTraitEffect {
  readonly breakpoint: number;
  readonly style: number;
  readonly variables: Readonly<Record<string, number>>;
}

export interface TFTTrait {
  readonly apiName: string;
  readonly name: string;
  readonly effects: readonly TFTTraitEffect[];
  readonly iconUrl: string;
  readonly descriptionTemplate: string | null;
}

export interface TFTDatasetMetadata {
  readonly setId: string;
  readonly sourceVersion: string;
  readonly championCount: number;
  readonly shopChampionCount?: number;
  readonly selectableChampionCount?: number;
  readonly traitCount: number;
  readonly opCount: number;
  readonly opConfigVersion: string;
  readonly roleConfigVersion: string;
  readonly starConfigVersion: string;
  readonly normalizerVersion?: string;
  readonly imageVersion: string;
  readonly payloadHash: string;
  readonly shopRosterSource: string;
  readonly excludedUnitCount: number;
}

export interface TFTChampionTraitPayload {
  readonly apiName?: string;
  readonly name: string;
  readonly iconUrl: string;
}

export interface TFTChampionPayload {
  readonly id: string;
  readonly baseId: string;
  readonly apiId: string;
  readonly name: string;
  readonly cost: Cost;
  readonly traits: readonly TFTChampionTraitPayload[];
  readonly imageUrl: string;
  readonly roles: readonly UnifiedChampionRole[];
  readonly primaryRole: UnifiedChampionRole | null;
  readonly secondaryRoles: readonly UnifiedChampionRole[];
  readonly roleEvidence: readonly ChampionRoleEvidence[];
  readonly meta: ChampionMeta;
  readonly combatStats: ChampionCombatStats;
  readonly starLevelStats: Readonly<
    Record<1 | 2 | 3, ChampionCombatStats>
  >;
  readonly staticPower: StaticPowerResult | null;
}

export interface TFTDatasetPayload {
  readonly schemaVersion: number;
  readonly dataVersion: string;
  readonly generatedAt: string;
  readonly sourceUpdatedAt: string | null;
  readonly champions: readonly TFTChampionPayload[];
  readonly traits: readonly TFTTrait[];
  readonly metadata: TFTDatasetMetadata;
}

export interface TFTData {
  readonly champions: Champion[];
  readonly traits: TFTTrait[];
  readonly dataVersion: string;
  readonly generatedAt: string;
  readonly sourceUpdatedAt: string | null;
  readonly metadata: TFTDatasetMetadata;
  readonly opEvaluationIndex: OpEvaluationIndex;
}

export interface TftRuntimeConfig {
  readonly datasetUrl: string;
  readonly statusUrl?: string;
  readonly assetBaseUrl?: string;
  readonly translationsUrl?: string;
  readonly settingsUrl?: string;
  readonly schemaVersion: number;
}

export const MISSING_TFT_RUNTIME_CONFIG_MESSAGE =
  "TFT REST API URL이 설정되지 않았습니다. 워드프레스 인라인 설정 또는 VITE_TFT_DATASET_URL이 필요합니다.";

const DEVELOPMENT_RUNTIME_CONFIG_KEY = "tft-development-runtime-config";

declare global {
  interface Window {
    __TFT_APP_CONFIG__?: TftRuntimeConfig;
  }
}

const COMBAT_STAT_KEYS = [
  "health",
  "attackDamage",
  "attackSpeed",
  "armor",
  "magicResistance",
  "attackRange",
  "startingMana",
  "maximumMana",
] as const satisfies readonly (keyof ChampionCombatStats)[];

const ROLE_VALUES = new Set<UnifiedChampionRole>([
  "physical-fighter",
  "magic-fighter",
  "physical-ranged",
  "magic-ranged",
  "physical-tank",
  "magic-tank",
  "physical-assassin",
  "magic-assassin",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumberOrNull = (value: unknown): boolean =>
  value === null || (typeof value === "number" && Number.isFinite(value));

const isCost = (value: unknown): value is Cost =>
  typeof value === "number" && [1, 2, 3, 4, 5].includes(value);

const isRole = (value: unknown): value is UnifiedChampionRole =>
  typeof value === "string" &&
  ROLE_VALUES.has(value as UnifiedChampionRole);

const isSafeAssetUrl = (value: unknown): value is string => {
  if (value === "") return true;
  if (typeof value !== "string") return false;
  try {
    const base =
      typeof window === "undefined"
        ? "https://localhost/"
        : window.location.href;
    const url = new URL(value, base);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const getResponseError = async (response: Response): Promise<Error> => {
  try {
    const body: unknown = await response.json();
    if (isRecord(body) && typeof body.message === "string" && body.message) {
      return new Error(body.message);
    }
  } catch {
    return new Error(`TFT REST API 요청 실패: HTTP ${response.status}`);
  }

  return new Error(`TFT REST API 요청 실패: HTTP ${response.status}`);
};

const isCombatStats = (value: unknown): value is ChampionCombatStats =>
  isRecord(value) &&
  COMBAT_STAT_KEYS.every((key) => isFiniteNumberOrNull(value[key]));

const isStarStats = (value: unknown): boolean =>
  isRecord(value) &&
  ["1", "2", "3"].every((star) => isCombatStats(value[star]));

const isChampionMeta = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.rangeType === "string" &&
  typeof value.damageType === "string" &&
  typeof value.combatRole === "string" &&
  typeof value.patchChangeType === "string" &&
  typeof value.buffedInLatestPatch === "boolean";

const isRoleEvidence = (value: unknown): boolean =>
  isRecord(value) &&
  (value.source === "api-role" || value.source === "range") &&
  typeof value.value === "string" &&
  typeof value.reason === "string";

const isTraitVariables = (value: unknown): boolean =>
  (Array.isArray(value) && value.length === 0) ||
  (isRecord(value) &&
    Object.values(value).every(
      (item) => typeof item === "number" && Number.isFinite(item),
    ));

const isTrait = (value: unknown): value is TFTTrait => {
  if (!isRecord(value)) return false;
  return (
    typeof value.apiName === "string" &&
    typeof value.name === "string" &&
    isSafeAssetUrl(value.iconUrl) &&
    (value.descriptionTemplate === null ||
      typeof value.descriptionTemplate === "string") &&
    Array.isArray(value.effects) &&
    value.effects.every(
      (effect) =>
        isRecord(effect) &&
        typeof effect.breakpoint === "number" &&
        Number.isFinite(effect.breakpoint) &&
        typeof effect.style === "number" &&
        Number.isFinite(effect.style) &&
        isTraitVariables(effect.variables),
    )
  );
};

const isStaticPowerResult = (value: unknown): boolean =>
  value === null ||
  (isRecord(value) &&
    typeof value.isOp === "boolean" &&
    Array.isArray(value.evaluations) &&
    value.evaluations.every(
      (evaluation) =>
        isRecord(evaluation) &&
        typeof evaluation.isOp === "boolean" &&
        typeof evaluation.championId === "string" &&
        (evaluation.starLevel === 2 || evaluation.starLevel === 3) &&
        Array.isArray(evaluation.roles) &&
        evaluation.roles.every(isRole) &&
        Array.isArray(evaluation.comparisons) &&
        Array.isArray(evaluation.passedComparisons),
    ));

const isChampionPayload = (value: unknown): value is TFTChampionPayload => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.baseId === "string" &&
    typeof value.apiId === "string" &&
    typeof value.name === "string" &&
    isCost(value.cost) &&
    isSafeAssetUrl(value.imageUrl) &&
    Array.isArray(value.traits) &&
    value.traits.every(
      (trait) =>
        isRecord(trait) &&
        (trait.apiName === undefined || typeof trait.apiName === "string") &&
        typeof trait.name === "string" &&
        isSafeAssetUrl(trait.iconUrl),
    ) &&
    Array.isArray(value.roles) &&
    value.roles.every(isRole) &&
    (value.primaryRole === null || isRole(value.primaryRole)) &&
    Array.isArray(value.secondaryRoles) &&
    value.secondaryRoles.every(isRole) &&
    Array.isArray(value.roleEvidence) &&
    value.roleEvidence.every(isRoleEvidence) &&
    isChampionMeta(value.meta) &&
    isCombatStats(value.combatStats) &&
    isStarStats(value.starLevelStats) &&
    isStaticPowerResult(value.staticPower)
  );
};

const isMetadata = (value: unknown): value is TFTDatasetMetadata =>
  isRecord(value) &&
  typeof value.setId === "string" &&
  typeof value.sourceVersion === "string" &&
  typeof value.championCount === "number" &&
  (value.shopChampionCount === undefined ||
    typeof value.shopChampionCount === "number") &&
  (value.selectableChampionCount === undefined ||
    typeof value.selectableChampionCount === "number") &&
  typeof value.traitCount === "number" &&
  typeof value.opCount === "number" &&
  typeof value.opConfigVersion === "string" &&
  typeof value.roleConfigVersion === "string" &&
  typeof value.starConfigVersion === "string" &&
  (value.normalizerVersion === undefined ||
    typeof value.normalizerVersion === "string") &&
  typeof value.imageVersion === "string" &&
  typeof value.payloadHash === "string" &&
  typeof value.shopRosterSource === "string" &&
  typeof value.excludedUnitCount === "number";

const readMountedRuntimeConfig = (): TftRuntimeConfig | undefined => {
  if (typeof document === "undefined") return undefined;

  const root = document.querySelector<HTMLElement>(
    "[data-tft-workspace-root][data-tft-dataset-url]",
  );
  const datasetUrl = root?.dataset.tftDatasetUrl;
  if (!datasetUrl) return undefined;

  const schemaVersion = Number(root.dataset.tftSchemaVersion);
  return {
    datasetUrl,
    assetBaseUrl: root.dataset.tftAssetBaseUrl || undefined,
    translationsUrl: root.dataset.tftTranslationsUrl || undefined,
    settingsUrl: root.dataset.tftSettingsUrl || undefined,
    schemaVersion: Number.isFinite(schemaVersion)
      ? schemaVersion
      : TFT_DATASET_SCHEMA_VERSION,
  };
};

const readDevelopmentRuntimeConfig = (): TftRuntimeConfig | undefined => {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return undefined;
  }

  try {
    const saved = window.localStorage.getItem(DEVELOPMENT_RUNTIME_CONFIG_KEY);
    if (!saved) return undefined;

    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed) || typeof parsed.datasetUrl !== "string") {
      return undefined;
    }

    return {
      datasetUrl: parsed.datasetUrl,
      assetBaseUrl:
        typeof parsed.assetBaseUrl === "string"
          ? parsed.assetBaseUrl
          : undefined,
      translationsUrl:
        typeof parsed.translationsUrl === "string"
          ? parsed.translationsUrl
          : undefined,
      settingsUrl:
        typeof parsed.settingsUrl === "string"
          ? parsed.settingsUrl
          : undefined,
      schemaVersion:
        typeof parsed.schemaVersion === "number"
          ? parsed.schemaVersion
          : TFT_DATASET_SCHEMA_VERSION,
    };
  } catch {
    return undefined;
  }
};

export const saveDevelopmentWordPressOrigin = (origin: string): void => {
  if (typeof window === "undefined") {
    throw new Error("브라우저에서만 개발용 워드프레스 주소를 저장할 수 있습니다.");
  }

  let base: URL;
  try {
    base = new URL(origin.trim());
  } catch {
    throw new Error("유효한 워드프레스 주소를 입력해 주세요.");
  }

  if (base.protocol !== "http:" && base.protocol !== "https:") {
    throw new Error("워드프레스 주소는 http 또는 https여야 합니다.");
  }

  base.search = "";
  base.hash = "";
  if (!base.pathname.endsWith("/")) {
    base.pathname = `${base.pathname}/`;
  }

  const runtimeConfig: TftRuntimeConfig = {
    datasetUrl: new URL("wp-json/my-tft-app/v1/dataset", base).href,
    assetBaseUrl: new URL("wp-content/uploads/my-tft-app/", base).href,
    translationsUrl: new URL(
      "wp-json/my-tft-app/v1/translations",
      base,
    ).href,
    settingsUrl: new URL("wp-json/my-tft-app/v1/settings", base).href,
    schemaVersion: TFT_DATASET_SCHEMA_VERSION,
  };
  window.localStorage.setItem(
    DEVELOPMENT_RUNTIME_CONFIG_KEY,
    JSON.stringify(runtimeConfig),
  );
};

const resolveDevelopmentAssetBaseUrl = (
  datasetUrl: string,
): string | undefined => {
  const configured = import.meta.env.VITE_TFT_ASSET_BASE_URL;
  if (configured) return configured;

  try {
    return new URL("/wp-content/uploads/my-tft-app/", datasetUrl).href;
  } catch {
    return undefined;
  }
};

export const deriveTranslationsUrl = (
  datasetUrl: string,
): string | undefined => {
  try {
    const base =
      typeof window === "undefined" ? "https://localhost/" : window.location.href;
    const dataset = new URL(datasetUrl, base);
    dataset.search = "";
    dataset.hash = "";
    return new URL("./translations", dataset).href.replace(/\/$/, "");
  } catch {
    return undefined;
  }
};

export const deriveSettingsUrl = (
  datasetUrl: string,
): string | undefined => {
  try {
    const base =
      typeof window === "undefined" ? "https://localhost/" : window.location.href;
    const dataset = new URL(datasetUrl, base);
    dataset.search = "";
    dataset.hash = "";
    return new URL("./settings", dataset).href;
  } catch {
    return undefined;
  }
};

export const resolveTftRuntimeConfig = (): TftRuntimeConfig => {
  const injected =
    typeof window !== "undefined" ? window.__TFT_APP_CONFIG__ : undefined;
  const developmentUrl = import.meta.env.VITE_TFT_DATASET_URL;
  const developmentTranslationsUrl =
    import.meta.env.VITE_TFT_TRANSLATIONS_URL;
  const config =
    injected ??
    readMountedRuntimeConfig() ??
    (developmentUrl
      ? {
          datasetUrl: developmentUrl,
          assetBaseUrl: resolveDevelopmentAssetBaseUrl(developmentUrl),
          translationsUrl:
            developmentTranslationsUrl ||
            deriveTranslationsUrl(developmentUrl),
          settingsUrl: deriveSettingsUrl(developmentUrl),
          schemaVersion: TFT_DATASET_SCHEMA_VERSION,
        }
      : readDevelopmentRuntimeConfig());
  if (!config || !config.datasetUrl) {
    throw new Error(MISSING_TFT_RUNTIME_CONFIG_MESSAGE);
  }
  if (config.schemaVersion !== TFT_DATASET_SCHEMA_VERSION) {
    throw new Error(
      `TFT 런타임 스키마 버전이 호환되지 않습니다: ${config.schemaVersion}`,
    );
  }
  return {
    ...config,
    translationsUrl:
      config.translationsUrl || deriveTranslationsUrl(config.datasetUrl),
    settingsUrl: config.settingsUrl || deriveSettingsUrl(config.datasetUrl),
  };
};

export const assertLocalAssetUrls = (
  payload: TFTDatasetPayload,
  assetBaseUrl: string,
): void => {
  const normalizedBase = new URL(assetBaseUrl).href;
  const urls = [
    ...payload.traits.map((trait) => trait.iconUrl),
    ...payload.champions.flatMap((champion) => [
      champion.imageUrl,
      ...champion.traits.map((trait) => trait.iconUrl),
    ]),
  ];
  if (
    urls.some(
      (url) =>
        url !== "" && !new URL(url, normalizedBase).href.startsWith(normalizedBase),
    )
  ) {
    throw new Error("TFT payload에 허용되지 않은 외부 이미지 URL이 있습니다.");
  }
};

export const parseTFTDatasetPayload = (
  value: unknown,
  expectedSchemaVersion = TFT_DATASET_SCHEMA_VERSION,
): TFTDatasetPayload => {
  if (!isRecord(value)) {
    throw new Error("TFT 데이터 응답이 객체가 아닙니다.");
  }
  if (value.schemaVersion !== expectedSchemaVersion) {
    throw new Error(
      `지원하지 않는 TFT 데이터 스키마입니다: ${String(value.schemaVersion)}`,
    );
  }
  if (
    typeof value.dataVersion !== "string" ||
    typeof value.generatedAt !== "string" ||
    !(
      value.sourceUpdatedAt === null ||
      typeof value.sourceUpdatedAt === "string"
    ) ||
    !Array.isArray(value.champions) ||
    !value.champions.every(isChampionPayload) ||
    !Array.isArray(value.traits) ||
    !value.traits.every(isTrait) ||
    !isMetadata(value.metadata)
  ) {
    throw new Error("TFT 데이터 응답의 필수 필드가 올바르지 않습니다.");
  }
  if (
    value.metadata.championCount !== value.champions.length ||
    value.metadata.traitCount !== value.traits.length
  ) {
    throw new Error("TFT 데이터 개수 메타데이터가 실제 payload와 다릅니다.");
  }
  return value as unknown as TFTDatasetPayload;
};

const createOpEvaluationIndex = (
  champions: readonly Champion[],
): OpEvaluationIndex => {
  const index = new Map<string, OpEvaluationResult>();
  for (const champion of champions) {
    for (const evaluation of champion.staticPower?.evaluations ?? []) {
      index.set(`${champion.id}:${evaluation.starLevel}`, evaluation);
    }
  }
  return index as OpEvaluationIndex;
};

const toChampion = (
  payload: TFTChampionPayload,
  includeAssetUrls: boolean,
): Champion => ({
  id: payload.id,
  baseId: payload.baseId,
  apiId: payload.apiId,
  name: payload.name,
  cost: payload.cost,
  traits: payload.traits.map((trait) => ({
    ...trait,
    iconUrl: includeAssetUrls ? trait.iconUrl : "",
  })),
  imageUrl: includeAssetUrls ? payload.imageUrl : "",
  roles: [...payload.roles],
  primaryRole: payload.primaryRole,
  secondaryRoles: [...payload.secondaryRoles],
  meta: { ...payload.meta },
  combatStats: { ...payload.combatStats },
  starLevelStats: {
    1: { ...payload.starLevelStats[1] },
    2: { ...payload.starLevelStats[2] },
    3: { ...payload.starLevelStats[3] },
  },
  staticPower: payload.staticPower,
});

const toTFTData = (
  payload: TFTDatasetPayload,
  includeAssetUrls: boolean,
): TFTData => {
  const champions = payload.champions.map((champion) =>
    toChampion(champion, includeAssetUrls),
  );
  return {
    champions,
    traits: payload.traits.map((trait) => {
      const effects = trait.effects.map((effect) => {
        const variables: unknown = effect.variables;
        return {
          ...effect,
          variables: Array.isArray(variables) ? {} : { ...effect.variables },
        };
      });
      return {
        ...trait,
        effects,
        iconUrl: includeAssetUrls ? trait.iconUrl : "",
      };
    }),
    dataVersion: payload.dataVersion,
    generatedAt: payload.generatedAt,
    sourceUpdatedAt: payload.sourceUpdatedAt,
    metadata: payload.metadata,
    opEvaluationIndex: createOpEvaluationIndex(champions),
  };
};

let tftDataRequest: Promise<TFTData> | null = null;
let lastGoodSessionData: TFTData | null = null;

const loadTFTData = async (): Promise<TFTData> => {
  const config = resolveTftRuntimeConfig();
  try {
    const response = await fetch(config.datasetUrl, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-cache",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw await getResponseError(response);
    }
    const payload = parseTFTDatasetPayload(
      await response.json(),
      config.schemaVersion,
    );
    const includeAssetUrls = Boolean(config.assetBaseUrl);
    if (includeAssetUrls) {
      assertLocalAssetUrls(payload, config.assetBaseUrl as string);
    }
    const data = toTFTData(payload, includeAssetUrls);
    lastGoodSessionData = data;
    return data;
  } catch (error) {
    if (lastGoodSessionData !== null) {
      return lastGoodSessionData;
    }
    throw error;
  }
};

export const fetchTFTData = (): Promise<TFTData> => {
  if (tftDataRequest === null) {
    tftDataRequest = loadTFTData().catch((error) => {
      tftDataRequest = null;
      throw error;
    });
  }
  return tftDataRequest;
};

export const resetTFTDataCache = (clearLastGood = false): void => {
  tftDataRequest = null;
  if (clearLastGood) lastGoodSessionData = null;
};
