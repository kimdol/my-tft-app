import { create } from "zustand";
import { resolveTftRuntimeConfig } from "../api/tftApi";
import type { ScoreWeights } from "../core/traitEvaluator";

export interface RuntimeRecommendationSettings {
  readonly beamWidth: number;
  readonly resultLimit: number;
  readonly traitWeight: number;
  readonly opBonus: number;
  readonly costWeight: number;
  readonly fighterBonus: number;
  readonly tankBonus: number;
  readonly rangedBonus: number;
  readonly assassinBonus: number;
  readonly defaultTeamSize: number;
  readonly maxTeamSize: number;
  readonly maxAdditionalTabs: number;
}

export const DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS: Readonly<RuntimeRecommendationSettings> =
  Object.freeze({
    beamWidth: 28,
    resultLimit: 5,
    traitWeight: 1,
    opBonus: 0.3,
    costWeight: 0.01,
    fighterBonus: 0.001,
    tankBonus: 0.001,
    rangedBonus: 0.001,
    assassinBonus: 0.001,
    defaultTeamSize: 4,
    maxTeamSize: 15,
    maxAdditionalTabs: 2,
  });

interface RuntimeSettingsPayload {
  readonly schemaVersion?: unknown;
  readonly version?: unknown;
  readonly recommendation?: unknown;
}

interface RuntimeSettingsState {
  readonly recommendation: RuntimeRecommendationSettings;
  readonly version: string;
  readonly refresh: () => Promise<void>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const boundedNumber = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
  integer = false,
): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const bounded = Math.min(maximum, Math.max(minimum, parsed));
  return integer ? Math.trunc(bounded) : bounded;
};

export const parseRuntimeRecommendationSettings = (
  value: unknown,
): RuntimeRecommendationSettings => {
  if (!isRecord(value)) return { ...DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS };
  const maxTeamSize = boundedNumber(value.maxTeamSize, 15, 1, 15, true);

  return {
    beamWidth: boundedNumber(value.beamWidth, 28, 1, 200, true),
    resultLimit: boundedNumber(value.resultLimit, 5, 1, 20, true),
    traitWeight: boundedNumber(value.traitWeight, 1, 0, 100),
    opBonus: boundedNumber(value.opBonus, 0.3, 0, 100),
    costWeight: boundedNumber(value.costWeight, 0.01, 0, 100),
    fighterBonus: boundedNumber(value.fighterBonus, 0.001, 0, 100),
    tankBonus: boundedNumber(value.tankBonus, 0.001, 0, 100),
    rangedBonus: boundedNumber(value.rangedBonus, 0.001, 0, 100),
    assassinBonus: boundedNumber(value.assassinBonus, 0.001, 0, 100),
    defaultTeamSize: boundedNumber(
      value.defaultTeamSize,
      Math.min(4, maxTeamSize),
      1,
      maxTeamSize,
      true,
    ),
    maxTeamSize,
    maxAdditionalTabs: boundedNumber(
      value.maxAdditionalTabs,
      2,
      0,
      8,
      true,
    ),
  };
};

export const toScoreWeights = (
  settings: RuntimeRecommendationSettings,
): ScoreWeights => ({
  traitWeight: settings.traitWeight,
  opBonus: settings.opBonus,
  costWeight: settings.costWeight,
  fighterBonus: settings.fighterBonus,
  tankBonus: settings.tankBonus,
  rangedBonus: settings.rangedBonus,
  assassinBonus: settings.assassinBonus,
});

export const fetchRuntimeSettings = async (): Promise<{
  readonly recommendation: RuntimeRecommendationSettings;
  readonly version: string;
} | null> => {
  const url = resolveTftRuntimeConfig().settingsUrl;
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as RuntimeSettingsPayload;
    if (payload.schemaVersion !== 1) return null;
    return {
      recommendation: parseRuntimeRecommendationSettings(
        payload.recommendation,
      ),
      version:
        typeof payload.version === "string" ? payload.version : "server",
    };
  } catch {
    return null;
  }
};

export const useRuntimeSettingsStore = create<RuntimeSettingsState>((set) => ({
  recommendation: { ...DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS },
  version: "bundled-defaults",
  refresh: async () => {
    const next = await fetchRuntimeSettings();
    if (next) set(next);
  },
}));
