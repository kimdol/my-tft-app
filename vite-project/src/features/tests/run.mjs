import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const vite = await createServer({
  root: process.cwd(),
  envFile: false,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});

const tests = [];
const test = (name, run) => tests.push({ name, run });
const assertClose = (actual, expected, epsilon = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );

const EMPTY_STATS = Object.freeze({
  health: null,
  attackDamage: null,
  attackSpeed: null,
  armor: null,
  magicResistance: null,
  attackRange: null,
  startingMana: null,
  maximumMana: null,
});

const BASE_STATS = Object.freeze({
  health: 1000,
  attackDamage: 100,
  attackSpeed: 0.75,
  armor: 50,
  magicResistance: 50,
  attackRange: 1,
  startingMana: 20,
  maximumMana: 80,
});

const META = Object.freeze({
  rangeType: "melee",
  damageType: "physical",
  combatRole: "fighter",
  patchChangeType: "unknown",
  buffedInLatestPatch: false,
});

const ROLE = "physical-fighter";

const makeComparison = (championId, championName) => ({
  role: ROLE,
  baselineSource: "five-cost-three-star",
  baselineChampionId: "baseline",
  baselineChampionBaseId: "baseline",
  baselineChampionName: "기준 유닛",
  baselineCost: 5,
  baselineStarLevel: 3,
  matchedStats: [
    {
      stat: "attackDamage",
      championValue: 150,
      baselineValue: 140,
      difference: 10,
    },
  ],
  missingStats: [],
  comparedStatCount: 4,
  isMatch: true,
  championId,
  championName,
});

const makeStaticPower = (id, name, isOp = true) => {
  const comparison = makeComparison(id, name);
  const evaluation = {
    isOp,
    championId: id,
    championBaseId: id,
    championName: name,
    cost: 3,
    starLevel: 3,
    roles: [ROLE],
    baselineSource: "five-cost-three-star",
    comparisons: [comparison],
    passedComparisons: isOp ? [comparison] : [],
    failureReason: isOp ? null : "threshold-not-met",
    opConfigVersion: "server-rules-v1",
  };
  return {
    championId: id,
    baseId: id,
    championName: name,
    cost: 3,
    roleProfile: {
      primaryRole: ROLE,
      secondaryRoles: [],
      roles: [ROLE],
      evidence: [],
    },
    evaluations: [evaluation],
    opStarLevels: isOp ? [3] : [],
    passedComparisons: isOp ? [comparison] : [],
    isOp,
    opConfigVersion: "server-rules-v1",
  };
};

const makeChampion = (
  id,
  {
    baseId = id,
    name = id,
    cost = 1,
    traits = [],
    roles = [ROLE],
    primaryRole = roles[0] ?? null,
    secondaryRoles = roles.slice(1),
    stats = BASE_STATS,
    starStats,
    isOp = false,
  } = {},
) => {
  const levelStats = starStats ?? {
    1: { ...stats },
    2: {
      ...stats,
      health: stats.health === null ? null : stats.health * 1.8,
      attackDamage:
        stats.attackDamage === null ? null : stats.attackDamage * 1.5,
    },
    3: {
      ...stats,
      health: stats.health === null ? null : stats.health * 3.24,
      attackDamage:
        stats.attackDamage === null ? null : stats.attackDamage * 2.25,
    },
  };
  return {
    id,
    baseId,
    apiId: id,
    name,
    cost,
    traits,
    imageUrl: `https://example.test/wp-content/uploads/my-tft-app/${id}.png`,
    roles,
    primaryRole,
    secondaryRoles,
    roleEvidence: [],
    meta: META,
    combatStats: { ...stats },
    starLevelStats: levelStats,
    staticPower: makeStaticPower(id, name, isOp),
  };
};

const datasetPayload = (champions = [makeChampion("alpha")]) => ({
  schemaVersion: 1,
  dataVersion: "set-1-test",
  generatedAt: "2026-07-21T00:00:00Z",
  sourceUpdatedAt: null,
  champions,
  traits: [
    {
      apiName: "warrior",
      name: "전사",
      effects: [{ breakpoint: 2, style: 1, variables: {} }],
      iconUrl: "https://example.test/wp-content/uploads/my-tft-app/trait.png",
      descriptionTemplate: null,
    },
  ],
  metadata: {
    setId: "1",
    sourceVersion: "test",
    championCount: champions.length,
    traitCount: 1,
    opCount: champions.filter((champion) => champion.staticPower?.isOp).length,
    opConfigVersion: "server-rules-v1",
    roleConfigVersion: "server-role-v1",
    starConfigVersion: "server-star-v1",
    imageVersion: "images-v1",
    payloadHash: "a".repeat(64),
    shopRosterSource: "communitydragon-team-planner",
    excludedUnitCount: 0,
  },
});

try {
  const { Node } = await vite.ssrLoadModule(
    "/src/features/core/Node.ts",
  );
  const { createShuffleSeed, seededShuffle } = await vite.ssrLoadModule(
    "/src/features/core/candidateOrder.ts",
  );
  const { findBestCombinationBeam } = await vite.ssrLoadModule(
    "/src/features/core/beamSearchOptimizer.ts",
  );
  const {
    calcTraitScoreBreakdown,
    createActiveTraitDetails,
    DEFAULT_SCORE_WEIGHTS,
  } = await vite.ssrLoadModule(
    "/src/features/core/traitEvaluator.ts",
  );
  const { BEAM_SEARCH_WEIGHTS } = await vite.ssrLoadModule(
    "/src/features/config/beamSearchConfig.ts",
  );
  const {
    DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS,
    parseRuntimeRecommendationSettings,
    toScoreWeights,
  } = await vite.ssrLoadModule(
    "/src/features/config/runtimeSettings.ts",
  );
  const {
    fetchTFTData,
    assertLocalAssetUrls,
    parseTFTDatasetPayload,
    resetTFTDataCache,
    saveDevelopmentWordPressOrigin,
    deriveTranslationsUrl,
  } = await vite.ssrLoadModule("/src/features/api/tftApi.ts");
  const { createRecommendationInputSignature } =
    await vite.ssrLoadModule(
      "/src/features/team-builder/recommendationSignature.ts",
    );
  const { createChampionCardViewModel } = await vite.ssrLoadModule(
    "/src/features/team-builder/view-models/championCardViewModel.ts",
  );
  const { createRecommendedUnitGroups } = await vite.ssrLoadModule(
    "/src/features/team-builder/view-models/recommendedUnitGroups.ts",
  );
  const { ChampionContent, StaticOpContent } = await vite.ssrLoadModule(
    "/src/features/details/DetailPopover.tsx",
  );
  const { default: StaticOpBadge } = await vite.ssrLoadModule(
    "/src/features/op-details/StaticOpBadge.tsx",
  );
  const { default: ChampionCard } = await vite.ssrLoadModule(
    "/src/features/selector/champion-selector/components/ChampionCard.tsx",
  );
  const { default: TeamResultHeader } = await vite.ssrLoadModule(
    "/src/features/team-builder/components/team-result-card/TeamResultHeader.tsx",
  );
  const { useTFTBuilderStore } = await vite.ssrLoadModule(
    "/src/features/store/useTFTBuilderStore.ts",
  );
  const { useRecommendationStore } = await vite.ssrLoadModule(
    "/src/features/team-builder/recommendationStore.ts",
  );
  const {
    getSelectableChampionsByCost,
    getSelectableChampionsByRole,
  } = await vite.ssrLoadModule(
    "/src/features/store/useTFTBuilderStore.ts",
  );
  const { useSelectorModeStore } = await vite.ssrLoadModule(
    "/src/features/store/useSelectorModeStore.ts",
  );
  const { GUIDE_LANGUAGE_OPTIONS, GUIDE_LOCALES } = await vite.ssrLoadModule(
    "/src/features/workspace/guide/guideLocales.ts",
  );
  const { APP_LOCALES } = await vite.ssrLoadModule(
    "/src/features/i18n/appLocales.ts",
  );
  const { resolveLocalizedChampionName } = await vite.ssrLoadModule(
    "/src/features/i18n/championName.ts",
  );
  const {
    createBundledTranslationCatalog,
    parseTranslationCatalog,
  } = await vite.ssrLoadModule(
    "/src/features/i18n/translationCatalog.ts",
  );
  const {
    clearTranslationCatalogCache,
    fetchTranslationCatalog,
    readCachedTranslationCatalog,
  } = await vite.ssrLoadModule(
    "/src/features/i18n/translationApi.ts",
  );
  const { CHAMPION_SELECTOR_STRATEGIES } = await vite.ssrLoadModule(
    "/src/features/selector/champion-selector/selectorStrategies.ts",
  );
  const { getAdjacentSwipeIndex } = await vite.ssrLoadModule(
    "/src/features/workspace/carouselNavigation.ts",
  );
  const { getWorkspaceNavigationBehavior } = await vite.ssrLoadModule(
    "/src/features/workspace/hooks/useWorkspaceCarousel.ts",
  );
  const { resolveDeviceLocale } = await vite.ssrLoadModule(
    "/src/features/i18n/deviceLocale.ts",
  );
  const { filterChampionsByQuery } = await vite.ssrLoadModule(
    "/src/features/utils/searchUtils.ts",
  );
  const { formatActiveTraitDescription } = await vite.ssrLoadModule(
    "/src/features/core/traitDescriptionFormatter.ts",
  );
  const {
    CHAMPION_PROGRESSIVE_PROFILE,
    TRAIT_PROGRESSIVE_PROFILE,
    getProgressivePageSize,
  } = await vite.ssrLoadModule(
    "/src/features/selector/hooks/useProgressiveRenderCount.ts",
  );

  const trait = {
    apiName: "warrior",
    name: "전사",
    iconUrl: "",
    descriptionTemplate: null,
    effects: [{ breakpoint: 1, style: 1, variables: {} }],
  };
  const op = makeChampion("op", {
    name: "OP 유닛",
    cost: 3,
    traits: [{ name: "전사", iconUrl: "" }],
    isOp: true,
  });
  const normal = makeChampion("normal", {
    name: "일반 유닛",
    cost: 3,
    traits: [{ name: "전사", iconUrl: "" }],
  });

  test("Node paths are immutable and deterministically sorted", () => {
    const source = ["b", "a"];
    const node = new Node(source);
    source.push("c");
    assert.deepEqual(node.toArray(), ["a", "b"]);
    assert.deepEqual(node.push("c").toArray(), ["a", "b", "c"]);
  });

  test("seeded candidate order is pure and reproducible", () => {
    const source = ["a", "b", "c", "d"];
    assert.deepEqual(seededShuffle(source, 42), seededShuffle(source, 42));
    assert.deepEqual(source, ["a", "b", "c", "d"]);
  });

  test("random candidate runs receive a valid unsigned seed", () => {
    const seed = createShuffleSeed();
    assert.ok(Number.isInteger(seed));
    assert.ok(seed >= 0 && seed <= 0xffffffff);
  });

  test("default OP bonus is exactly 0.3", () => {
    assert.equal(BEAM_SEARCH_WEIGHTS.opBonus, 0.3);
    assert.equal(DEFAULT_SCORE_WEIGHTS.opBonus, 0.3);
  });

  test("default role bonuses are exactly 0.001 per matching unit", () => {
    for (const key of [
      "fighterBonus",
      "tankBonus",
      "rangedBonus",
      "assassinBonus",
    ]) {
      assert.equal(BEAM_SEARCH_WEIGHTS[key], 0.001);
      assert.equal(DEFAULT_SCORE_WEIGHTS[key], 0.001);
    }
  });

  test("role bonuses add once per unit and category", () => {
    const fighter = makeChampion("role-fighter", {
      roles: ["physical-fighter", "magic-fighter"],
      primaryRole: "physical-fighter",
    });
    const tank = makeChampion("role-tank", {
      roles: ["magic-tank"],
      primaryRole: "magic-tank",
    });
    const ranged = makeChampion("role-ranged", {
      roles: ["physical-ranged"],
      primaryRole: "physical-ranged",
    });
    const assassin = makeChampion("role-assassin", {
      roles: ["magic-assassin"],
      primaryRole: "magic-assassin",
    });
    const defaultBreakdown = calcTraitScoreBreakdown(
      new Map(),
      new Node([fighter.id, tank.id, assassin.id]),
      new Map([
        [fighter.id, fighter],
        [tank.id, tank],
        [assassin.id, assassin],
      ]),
      new Map(),
    );
    assertClose(defaultBreakdown.roleBonusScore, 0.003);

    const breakdown = calcTraitScoreBreakdown(
      new Map(),
      new Node([fighter.id, tank.id, ranged.id, assassin.id]),
      new Map([
        [fighter.id, fighter],
        [tank.id, tank],
        [ranged.id, ranged],
        [assassin.id, assassin],
      ]),
      new Map(),
      {
        ...DEFAULT_SCORE_WEIGHTS,
        fighterBonus: 0.01,
        tankBonus: 0.02,
        rangedBonus: 0.03,
        assassinBonus: 0.04,
      },
    );
    assertClose(breakdown.roleBonusScore, 0.1);
  });

  test("administrator assassin bonus changes beam ranking", () => {
    const ranged = makeChampion("ranking-ranged", {
      cost: 1,
      roles: ["magic-ranged"],
      primaryRole: "magic-ranged",
    });
    const assassin = makeChampion("ranking-assassin", {
      cost: 1,
      roles: ["magic-assassin"],
      primaryRole: "magic-assassin",
    });
    const runtimeSettings = parseRuntimeRecommendationSettings({
      ...DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS,
      traitWeight: 0,
      opBonus: 0,
      costWeight: 0,
      fighterBonus: 0,
      tankBonus: 0,
      rangedBonus: 0,
      assassinBonus: 0.5,
    });
    const results = findBestCombinationBeam(
      [],
      new Map(),
      [ranged, assassin],
      [],
      1,
      {
        beamWidth: 2,
        resultLimit: 2,
        scoreWeights: toScoreWeights(runtimeSettings),
      },
    );
    assert.equal(results[0].node.toArray()[0], assassin.id);
    assertClose(results[0].scoreBreakdown.roleBonusScore, 0.5);
    assertClose(results[1].scoreBreakdown.roleBonusScore, 0);
  });

  test("OP champion receives one raw 0.3 bonus", () => {
    const breakdown = calcTraitScoreBreakdown(
      new Map(),
      new Node([op.id]),
      new Map([[op.id, op]]),
      new Map([[trait.name, trait]]),
    );
    assertClose(breakdown.opBonusScore, 0.3);
    assertClose(
      breakdown.totalScore,
      breakdown.synergyScore +
        breakdown.staticPowerScore +
        breakdown.opBonusScore +
        breakdown.costScore +
        breakdown.roleBonusScore,
    );
  });

  test("non-OP champion receives no OP bonus", () => {
    const breakdown = calcTraitScoreBreakdown(
      new Map(),
      new Node([normal.id]),
      new Map([[normal.id, normal]]),
      new Map([[trait.name, trait]]),
    );
    assert.equal(breakdown.opBonusScore, 0);
  });

  test("duplicate variants of one baseId receive one OP bonus", () => {
    const variant = makeChampion("op-variant", {
      baseId: op.baseId,
      isOp: true,
    });
    const breakdown = calcTraitScoreBreakdown(
      new Map(),
      new Node([op.id, variant.id]),
      new Map([
        [op.id, op],
        [variant.id, variant],
      ]),
      new Map(),
    );
    assertClose(breakdown.opBonusScore, 0.3);
  });

  test("multiple server roles do not multiply the OP bonus", () => {
    const multiRole = makeChampion("multi-role", {
      roles: ["physical-fighter", "magic-fighter"],
      isOp: true,
    });
    const breakdown = calcTraitScoreBreakdown(
      new Map(),
      new Node([multiRole.id]),
      new Map([[multiRole.id, multiRole]]),
      new Map(),
    );
    assertClose(breakdown.opBonusScore, 0.3);
  });

  test("OP bonus changes beam ranking without rounded sorting", () => {
    const results = findBestCombinationBeam(
      [],
      new Map(),
      [normal, op],
      [],
      1,
      { beamWidth: 2, resultLimit: 2 },
    );
    assert.equal(results[0].node.toArray()[0], op.id);
    assert.ok(results[0].score > results[1].score);
  });

  test("beam search remains deterministic for the same seed", () => {
    const input = [normal, op, makeChampion("third", { cost: 2 })];
    const run = () =>
      findBestCombinationBeam([], new Map(), input, [], 2, {
        beamWidth: 5,
        resultLimit: 3,
        shuffleCandidates: true,
        seed: 7,
      }).map((result) => [result.node.key(), result.score]);
    assert.deepEqual(run(), run());
  });

  test("candidate shuffle changes the tie-breaking exploration order", () => {
    const tiedCandidates = ["a", "b", "c", "d"].map((id) =>
      makeChampion(id, { cost: 1 }),
    );
    const chosenKeys = [1, 2, 3, 4].map(
      (seed) =>
        findBestCombinationBeam(
          [],
          new Map(),
          tiedCandidates,
          [],
          1,
          { beamWidth: 1, resultLimit: 1, shuffleCandidates: true, seed },
        )[0].node.key(),
    );
    assert.ok(new Set(chosenKeys).size > 1);
  });

  test("active trait details preserve server trait breakpoints", () => {
    const details = createActiveTraitDetails(
      new Map(),
      new Node([op.id]),
      new Map([[op.id, op]]),
      new Map([[trait.name, trait]]),
    );
    assert.equal(details[0].activeBreakpoint, 1);
    assert.equal(details[0].champions[0].name, op.name);
  });

  test("active trait detail selects the visible row for the active tier", () => {
    const description = formatActiveTraitDescription(
      "<row>At @MinUnits@: @Damage@ damage.</row><row>At @MinUnits@: @Damage@ damage.</row>",
      { breakpoint: 4, style: 2, variables: { Damage: 250 } },
      1,
    );
    assert.equal(description, "At 4: 250 damage.");
  });

  test("recommendation signature invalidates when server OP changes", () => {
    const input = {
      traits: [],
      selectedChampionIds: new Set([normal.id]),
      fixedChampionIds: new Set(),
      selectedTraits: new Map(),
      teamSize: 1,
      shuffleCandidates: false,
      runtimeSettings: DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS,
      runtimeSettingsVersion: "test-settings",
    };
    const before = createRecommendationInputSignature({
      ...input,
      champions: [normal],
    });
    const after = createRecommendationInputSignature({
      ...input,
      champions: [{ ...normal, staticPower: makeStaticPower(normal.id, normal.name, true) }],
    });
    assert.notEqual(before, after);
  });

  test("recommendation signature invalidates when a champion role changes", () => {
    const input = {
      traits: [],
      selectedChampionIds: new Set([normal.id]),
      fixedChampionIds: new Set(),
      selectedTraits: new Map(),
      teamSize: 1,
      shuffleCandidates: false,
      runtimeSettings: DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS,
      runtimeSettingsVersion: "test-settings",
    };
    const before = createRecommendationInputSignature({
      ...input,
      champions: [normal],
    });
    const after = createRecommendationInputSignature({
      ...input,
      champions: [{
        ...normal,
        roles: ["magic-tank"],
        primaryRole: "magic-tank",
      }],
    });
    assert.notEqual(before, after);
  });

  test("recommendation signature invalidates when assassin bonus changes", () => {
    const input = {
      champions: [normal],
      traits: [],
      selectedChampionIds: new Set([normal.id]),
      fixedChampionIds: new Set(),
      selectedTraits: new Map(),
      teamSize: 1,
      shuffleCandidates: false,
      runtimeSettingsVersion: "test-settings",
    };
    const before = createRecommendationInputSignature({
      ...input,
      runtimeSettings: DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS,
    });
    const after = createRecommendationInputSignature({
      ...input,
      runtimeSettings: {
        ...DEFAULT_RUNTIME_RECOMMENDATION_SETTINGS,
        assassinBonus: 0.5,
      },
    });
    assert.notEqual(before, after);
  });

  test("card view model uses server roles and precomputed star values", () => {
    const champion = makeChampion("server-role", {
      name: "서버 역할",
      roles: ["magic-ranged"],
      primaryRole: "magic-ranged",
      starStats: {
        1: { ...BASE_STATS, health: 111 },
        2: { ...BASE_STATS, health: 222 },
        3: { ...BASE_STATS, health: 333 },
      },
    });
    const viewModel = createChampionCardViewModel(champion, false, null);
    assert.equal(viewModel.primaryRoleLabel, "마법 원거리");
    const health = viewModel.combatStats.find((stat) => stat.key === "health");
    assert.deepEqual(health.values, { 1: "111", 2: "222", 3: "333" });
  });

  test("missing star stats display an em dash instead of zero", () => {
    const champion = makeChampion("missing", {
      stats: EMPTY_STATS,
      starStats: { 1: EMPTY_STATS, 2: EMPTY_STATS, 3: EMPTY_STATS },
    });
    const viewModel = createChampionCardViewModel(champion, false, null);
    assert.ok(
      viewModel.combatStats.every((stat) =>
        Object.values(stat.values).every((value) => value === "—"),
      ),
    );
  });

  test("champion detail renders accessible 1/2/3-star columns", () => {
    const viewModel = createChampionCardViewModel(op, false, null);
    const markup = renderToStaticMarkup(
      createElement(ChampionContent, {
        content: { kind: "champion", champion: viewModel },
      }),
    );
    assert.match(markup, /1성/);
    assert.match(markup, /2성/);
    assert.match(markup, /3성/);
    assert.match(markup, /role="table"/);
  });

  test("OP detail presents only the compared role, units, values, and difference", () => {
    const evaluation = op.staticPower.evaluations[0];
    const markup = renderToStaticMarkup(
      createElement(StaticOpContent, {
        content: { kind: "static-op", evaluation },
      }),
    );
    assert.match(markup, /판정 역할/);
    assert.match(markup, /기준 유닛 \( 5코스트 3성 \)/);
    assert.match(markup, /후보.*OP 유닛 \( 3코스트 3성 \)/);
    assert.match(markup, /차이/);
    assert.doesNotMatch(markup, /3성 기본 스탯을 같은 역할의 기준 유닛과 엄격하게 비교했습니다/);
  });

  test("OP popover removes its visual champion title", async () => {
    const source = await readFile(
      new URL("../details/DetailPopover.tsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /state\.content\.kind === "static-op"\s*\? \{ title: null, description: null \}/);
    assert.match(source, /aria-label=\{header\.title === null \? copy\.detail\.comparisonInfo : undefined\}/);
  });

  test("interactive OP badge remains a real accessible button", () => {
    const evaluation = op.staticPower.evaluations[0];
    const markup = renderToStaticMarkup(
      createElement(StaticOpBadge, { evaluation }),
    );
    assert.match(markup, /^<button/);
    assert.match(markup, /비교 정보/);
    assert.match(markup, /from-indigo-600/);
    assert.doesNotMatch(markup, /rose-/);
  });

  test("empty champion images render the fallback instead of an empty src", () => {
    const markup = renderToStaticMarkup(
      createElement(ChampionCard, {
        champion: { ...op, imageUrl: "" },
        isSelected: false,
        onToggle: () => {},
        strategy: CHAMPION_SELECTOR_STRATEGIES.candidate,
      }),
    );
    assert.match(markup, />O</);
    assert.doesNotMatch(markup, /<img/);
    assert.match(markup, /data-champion-info-trigger/);
    assert.match(markup, /챔피언 상세 정보/);
  });

  test("team score header shows only the total score", () => {
    const markup = renderToStaticMarkup(
      createElement(TeamResultHeader, {
        score: 2.34,
        onApply: () => {},
      }),
    );
    assert.match(markup, /2\.34/);
    assert.doesNotMatch(markup, /시너지|코스트|>OP</);
  });

  test("recommended groups read OP evaluation directly from champion payload", () => {
    const groups = createRecommendedUnitGroups(
      [op.id, normal.id],
      new Map([
        [op.id, op],
        [normal.id, normal],
      ]),
      new Set(),
    );
    assert.equal(groups.candidateUnits.find((item) => item.id === op.id).opEvaluation.isOp, true);
    assert.equal(groups.candidateUnits.find((item) => item.id === normal.id).opEvaluation, null);
  });

  test("runtime parser accepts a complete server snapshot", () => {
    const parsed = parseTFTDatasetPayload(datasetPayload([op]));
    assert.equal(parsed.dataVersion, "set-1-test");
    assert.equal(parsed.champions[0].staticPower.isOp, true);
  });

  test("runtime parser accepts legacy empty trait variables only", () => {
    const legacy = datasetPayload([op]);
    legacy.traits[0].effects[0].variables = [];
    assert.deepEqual(
      parseTFTDatasetPayload(legacy).traits[0].effects[0].variables,
      [],
    );

    const invalid = datasetPayload([op]);
    invalid.traits[0].effects[0].variables = [1];
    assert.throws(
      () => parseTFTDatasetPayload(invalid),
      /필수 필드가 올바르지 않습니다/,
    );
  });

  test("client normalizes legacy empty trait variables to an object", async () => {
    resetTFTDataCache(true);
    globalThis.window = {
      location: { href: "https://example.test/tft" },
      __TFT_APP_CONFIG__: {
        datasetUrl: "https://example.test/wp-json/my-tft-app/v1/dataset",
        assetBaseUrl: "",
        schemaVersion: 1,
      },
    };
    globalThis.fetch = async () => {
      const legacy = datasetPayload([op]);
      legacy.traits[0].effects[0].variables = [];
      return { ok: true, status: 200, json: async () => legacy };
    };
    const data = await fetchTFTData();
    assert.deepEqual(data.traits[0].effects[0].variables, {});
  });

  test("runtime parser rejects incompatible schema versions", () => {
    assert.throws(
      () => parseTFTDatasetPayload({ ...datasetPayload(), schemaVersion: 2 }),
      /스키마/,
    );
  });

  test("runtime parser rejects direct external source images", () => {
    const bad = datasetPayload([
      { ...op, imageUrl: "https://raw.communitydragon.org/image.png" },
    ]);
    const parsed = parseTFTDatasetPayload(bad);
    assert.throws(
      () =>
        assertLocalAssetUrls(
          parsed,
          "https://example.test/wp-content/uploads/my-tft-app/",
        ),
      /외부 이미지/,
    );
  });

  test("client shares one in-flight REST request", async () => {
    resetTFTDataCache(true);
    globalThis.window = {
      location: { href: "https://example.test/tft" },
      __TFT_APP_CONFIG__: {
        datasetUrl: "https://example.test/wp-json/my-tft-app/v1/dataset",
        assetBaseUrl: "https://example.test/wp-content/uploads/my-tft-app/",
        schemaVersion: 1,
      },
    };
    let calls = 0;
    let release;
    globalThis.fetch = () => {
      calls += 1;
      return new Promise((resolve) => {
        release = resolve;
      });
    };
    const first = fetchTFTData();
    const second = fetchTFTData();
    assert.equal(first, second);
    release({ ok: true, status: 200, json: async () => datasetPayload([op]) });
    const [left, right] = await Promise.all([first, second]);
    assert.equal(calls, 1);
    assert.equal(left, right);
  });

  test("runtime refresh revalidates WordPress data and removes stale season selections", async () => {
    resetTFTDataCache(true);
    const firstChampion = makeChampion("season-old");
    const nextChampion = makeChampion("season-new");
    const requestOptions = [];
    let calls = 0;
    globalThis.window = {
      location: { href: "https://example.test/tft" },
      __TFT_APP_CONFIG__: {
        datasetUrl:
          "https://example.test/wp-json/my-tft-app/v1/dataset?v=initial",
        assetBaseUrl:
          "https://example.test/wp-content/uploads/my-tft-app/",
        schemaVersion: 1,
      },
    };
    globalThis.fetch = async (_url, options) => {
      requestOptions.push(options);
      calls += 1;
      return {
        ok: true,
        status: 200,
        json: async () =>
          datasetPayload(calls === 1 ? [firstChampion] : [nextChampion]),
      };
    };
    useTFTBuilderStore.setState({
      champions: [],
      traits: [],
      selectedChampions: new Set(),
      fixedChampions: new Set(),
      selectedTraits: new Map(),
      loading: false,
      error: null,
      dataStatus: "idle",
    });

    await useTFTBuilderStore.getState().fetchAll();
    useTFTBuilderStore.setState({
      selectedChampions: new Set([firstChampion.id]),
      fixedChampions: new Set([firstChampion.id]),
      selectedTraits: new Map([["전사", 1]]),
    });
    await useTFTBuilderStore.getState().refreshAll();

    const refreshed = useTFTBuilderStore.getState();
    assert.equal(calls, 2);
    assert.equal(requestOptions[0].cache, "no-cache");
    assert.equal(requestOptions[1].cache, "no-cache");
    assert.deepEqual(
      refreshed.champions.map((champion) => champion.id),
      [nextChampion.id],
    );
    assert.equal(refreshed.selectedChampions.size, 0);
    assert.equal(refreshed.fixedChampions.size, 0);
    assert.equal(refreshed.selectedTraits.get("전사"), 1);
  });

  test("client keeps the last good session snapshot on network failure", async () => {
    resetTFTDataCache();
    globalThis.fetch = async () => {
      throw new Error("offline");
    };
    const fallback = await fetchTFTData();
    assert.equal(fallback.dataVersion, "set-1-test");
  });

  test("mounted WordPress settings keep text data available without asset URLs", async () => {
    resetTFTDataCache(true);
    globalThis.window = { location: { href: "https://example.test/tft" } };
    globalThis.document = {
      querySelector: () => ({
        dataset: {
          tftDatasetUrl: "https://example.test/wp-json/my-tft-app/v1/dataset",
          tftAssetBaseUrl: "",
          tftSchemaVersion: "1",
        },
      }),
    };
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => datasetPayload([op]),
    });
    const data = await fetchTFTData();
    assert.equal(data.champions[0].imageUrl, "");
    assert.equal(data.champions[0].traits[0].iconUrl, "");
    assert.equal(data.traits[0].iconUrl, "");
    delete globalThis.document;
    globalThis.window = {
      location: { href: "https://example.test/tft" },
      __TFT_APP_CONFIG__: {
        datasetUrl: "https://example.test/wp-json/my-tft-app/v1/dataset",
        assetBaseUrl: "https://example.test/wp-content/uploads/my-tft-app/",
        schemaVersion: 1,
      },
    };
  });

  test("saved development WordPress origin supplies the REST endpoint", async () => {
    resetTFTDataCache(true);
    const storage = new Map();
    globalThis.window = {
      location: { href: "http://127.0.0.1:5173/" },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
    };
    saveDevelopmentWordPressOrigin("https://wordpress.example.test/site");
    assert.equal(
      JSON.parse(storage.get("tft-development-runtime-config")).datasetUrl,
      "https://wordpress.example.test/site/wp-json/my-tft-app/v1/dataset",
    );
    assert.equal(
      JSON.parse(storage.get("tft-development-runtime-config")).settingsUrl,
      "https://wordpress.example.test/site/wp-json/my-tft-app/v1/settings",
    );
    let requestedUrl = "";
    globalThis.fetch = async (url) => {
      requestedUrl = String(url);
      const payload = datasetPayload([
        {
          ...op,
          imageUrl: "",
          traits: op.traits.map((trait) => ({ ...trait, iconUrl: "" })),
        },
      ]);
      payload.traits = payload.traits.map((trait) => ({
        ...trait,
        iconUrl: "",
      }));
      return { ok: true, status: 200, json: async () => payload };
    };
    await fetchTFTData();
    assert.equal(
      requestedUrl,
      "https://wordpress.example.test/site/wp-json/my-tft-app/v1/dataset",
    );
    globalThis.window = {
      location: { href: "https://example.test/tft" },
      __TFT_APP_CONFIG__: {
        datasetUrl: "https://example.test/wp-json/my-tft-app/v1/dataset",
        assetBaseUrl: "https://example.test/wp-content/uploads/my-tft-app/",
        schemaVersion: 1,
      },
    };
  });

  test("failed request is not cached permanently when no fallback exists", async () => {
    resetTFTDataCache(true);
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      if (calls === 1) throw new Error("temporary");
      return { ok: true, status: 200, json: async () => datasetPayload() };
    };
    await assert.rejects(fetchTFTData(), /temporary/);
    const recovered = await fetchTFTData();
    assert.equal(recovered.dataVersion, "set-1-test");
    assert.equal(calls, 2);
  });

  test("client surfaces the server dataset error message", async () => {
    resetTFTDataCache(true);
    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({
        message: "TFT 데이터를 먼저 동기화해야 합니다.",
      }),
    });
    await assert.rejects(fetchTFTData(), /TFT 데이터를 먼저 동기화해야 합니다/);
  });

  test("server OP results are indexed without re-evaluation", async () => {
    resetTFTDataCache(true);
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => datasetPayload(),
    });
    const data = await fetchTFTData();
    assert.equal(data.opEvaluationIndex.get("alpha:3").isOp, false);
    resetTFTDataCache(true);
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => datasetPayload([op]),
    });
    const withOp = await fetchTFTData();
    assert.equal(withOp.opEvaluationIndex.get(`${op.id}:3`).isOp, true);
  });

  test("selector modes remain mutually exclusive by baseId", () => {
    useTFTBuilderStore.setState({
      champions: [op, { ...op, id: "op-variant" }],
      traits: [],
      dataVersion: "test",
      datasetMetadata: null,
      opEvaluationIndex: new Map(),
      selectedChampions: new Set(),
      fixedChampions: new Set([op.id]),
      selectedTraits: new Map(),
      loading: false,
      error: null,
      dataStatus: "success",
    });
    useTFTBuilderStore.getState().toggle("op-variant");
    assert.equal(useTFTBuilderStore.getState().fixedChampions.size, 0);
    assert.equal(useTFTBuilderStore.getState().selectedChampions.has("op-variant"), true);
  });

  test("runtime recommendation settings clamp unsafe server values", () => {
    const parsed = parseRuntimeRecommendationSettings({
      beamWidth: 9999,
      resultLimit: 0,
      traitWeight: -2,
      opBonus: 0.75,
      costWeight: "0.02",
      fighterBonus: -1,
      tankBonus: "0.004",
      rangedBonus: 101,
      assassinBonus: "0.006",
      defaultTeamSize: 12,
      maxTeamSize: 8,
      maxAdditionalTabs: 99,
    });
    assert.deepEqual(parsed, {
      beamWidth: 200,
      resultLimit: 1,
      traitWeight: 0,
      opBonus: 0.75,
      costWeight: 0.02,
      fighterBonus: 0,
      tankBonus: 0.004,
      rangedBonus: 100,
      assassinBonus: 0.006,
      defaultTeamSize: 8,
      maxTeamSize: 8,
      maxAdditionalTabs: 8,
    });
  });

  test("recommendation child tabs keep all builder inputs and results independent", () => {
    const first = makeChampion("session-first");
    const second = makeChampion("session-second");
    useTFTBuilderStore.setState({
      champions: [first, second],
      selectedChampions: new Set(),
      fixedChampions: new Set(),
      selectedTraits: new Map(),
      selectionSessions: {
        default: {
          selectedChampions: new Set(),
          fixedChampions: new Set(),
          selectedTraits: new Map(),
        },
      },
      activeSelectionSessionId: "default",
    });
    const firstSession = {
      teamSize: 4,
      teamSizeCustomized: false,
      shuffleCandidates: false,
      snapshot: null,
      loading: false,
      needsRecalculation: false,
    };
    useRecommendationStore.setState({
      ...firstSession,
      tabIds: ["default"],
      activeTabId: "default",
      sessions: { default: firstSession },
      nextTabNumber: 2,
    });

    useTFTBuilderStore.getState().toggle(first.id);
    useRecommendationStore.getState().setTeamSize(6, 15);
    useRecommendationStore.getState().addTab(2, 4);
    const secondTabId = useRecommendationStore.getState().activeTabId;
    useTFTBuilderStore.getState().toggleFixed(second.id);
    useTFTBuilderStore.getState().updateTraitCount("전사", 2);
    useRecommendationStore.getState().setTeamSize(8, 15);
    useRecommendationStore.getState().setShuffleCandidates(true);

    useRecommendationStore.getState().activateTab("default");
    assert.deepEqual([...useTFTBuilderStore.getState().selectedChampions], [first.id]);
    assert.equal(useTFTBuilderStore.getState().fixedChampions.size, 0);
    assert.equal(useRecommendationStore.getState().teamSize, 6);
    assert.equal(useRecommendationStore.getState().shuffleCandidates, false);

    useRecommendationStore.getState().activateTab(secondTabId);
    assert.deepEqual([...useTFTBuilderStore.getState().fixedChampions], [second.id]);
    assert.equal(useTFTBuilderStore.getState().selectedTraits.get("전사"), 2);
    assert.equal(useRecommendationStore.getState().teamSize, 8);
    assert.equal(useRecommendationStore.getState().shuffleCandidates, true);

    useRecommendationStore.getState().addTab(2, 4);
    useRecommendationStore.getState().addTab(2, 4);
    assert.equal(useRecommendationStore.getState().tabIds.length, 3);
    const thirdTabId = useRecommendationStore.getState().activeTabId;
    useRecommendationStore.getState().closeTab(thirdTabId);
    assert.equal(useRecommendationStore.getState().tabIds.length, 2);
    assert.equal(useRecommendationStore.getState().activeTabId, secondTabId);
    assert.deepEqual([...useTFTBuilderStore.getState().fixedChampions], [second.id]);
  });

  test("copying a recommendation tab clones inputs into an independent new tab", async () => {
    const candidate = makeChampion("copy-candidate");
    const fixed = makeChampion("copy-fixed");
    const sourceSelection = {
      selectedChampions: new Set([candidate.id]),
      fixedChampions: new Set([fixed.id]),
      selectedTraits: new Map([["전사", 2]]),
    };
    useTFTBuilderStore.setState({
      champions: [candidate, fixed],
      selectedChampions: sourceSelection.selectedChampions,
      fixedChampions: sourceSelection.fixedChampions,
      selectedTraits: sourceSelection.selectedTraits,
      selectionSessions: { default: sourceSelection },
      activeSelectionSessionId: "default",
    });
    const sourceRecommendation = {
      teamSize: 7,
      teamSizeCustomized: true,
      shuffleCandidates: true,
      snapshot: {
        results: [],
        inputSignature: "source-result",
        generatedAt: 1,
      },
      loading: false,
      needsRecalculation: false,
    };
    useRecommendationStore.setState({
      ...sourceRecommendation,
      tabIds: ["default"],
      activeTabId: "default",
      sessions: { default: sourceRecommendation },
      nextTabNumber: 2,
    });

    useRecommendationStore.getState().copyActiveTab(1);
    const copiedTabId = useRecommendationStore.getState().activeTabId;
    const copiedSelection =
      useTFTBuilderStore.getState().selectionSessions[copiedTabId];
    assert.deepEqual([...copiedSelection.selectedChampions], [candidate.id]);
    assert.deepEqual([...copiedSelection.fixedChampions], [fixed.id]);
    assert.equal(copiedSelection.selectedTraits.get("전사"), 2);
    assert.notEqual(
      copiedSelection.selectedChampions,
      sourceSelection.selectedChampions,
    );
    assert.notEqual(copiedSelection.fixedChampions, sourceSelection.fixedChampions);
    assert.notEqual(copiedSelection.selectedTraits, sourceSelection.selectedTraits);
    assert.equal(useRecommendationStore.getState().teamSize, 7);
    assert.equal(useRecommendationStore.getState().shuffleCandidates, true);
    assert.equal(useRecommendationStore.getState().snapshot, null);

    useTFTBuilderStore.getState().clearChampionSelections();
    useTFTBuilderStore.getState().updateTraitCount("전사", 0);
    useRecommendationStore.getState().activateTab("default");
    assert.deepEqual(
      [...useTFTBuilderStore.getState().selectedChampions],
      [candidate.id],
    );
    assert.deepEqual(
      [...useTFTBuilderStore.getState().fixedChampions],
      [fixed.id],
    );
    assert.equal(useTFTBuilderStore.getState().selectedTraits.get("전사"), 2);

    useRecommendationStore.getState().copyActiveTab(1);
    assert.equal(useRecommendationStore.getState().tabIds.length, 2);

    const tabsSource = await readFile(
      new URL(
        "../team-builder/components/RecommendationTabs.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(tabsSource, /data-copy-recommendation-tab/);
    assert.match(tabsSource, /copyActiveTab/);
  });

  test("active recommendation tab reset clears candidates, fixed units, and traits only in that tab", async () => {
    const first = makeChampion("reset-default");
    const second = makeChampion("reset-active");
    const defaultSession = {
      selectedChampions: new Set([first.id]),
      fixedChampions: new Set(),
      selectedTraits: new Map([["전사", 1]]),
    };
    useTFTBuilderStore.setState({
      champions: [first, second],
      selectedChampions: defaultSession.selectedChampions,
      fixedChampions: defaultSession.fixedChampions,
      selectedTraits: defaultSession.selectedTraits,
      selectionSessions: { default: defaultSession },
      activeSelectionSessionId: "default",
    });

    useTFTBuilderStore.getState().createSelectionSession("reset-tab");
    useTFTBuilderStore.getState().activateSelectionSession("reset-tab");
    useTFTBuilderStore.getState().toggle(second.id);
    useTFTBuilderStore.getState().toggleFixed(first.id);
    useTFTBuilderStore.getState().updateTraitCount("전사", 2);
    useTFTBuilderStore.getState().clear();

    const resetState = useTFTBuilderStore.getState();
    assert.equal(resetState.selectedChampions.size, 0);
    assert.equal(resetState.fixedChampions.size, 0);
    assert.equal(resetState.selectedTraits.size, 0);

    useTFTBuilderStore.getState().activateSelectionSession("default");
    assert.deepEqual(
      [...useTFTBuilderStore.getState().selectedChampions],
      [first.id],
    );
    assert.equal(useTFTBuilderStore.getState().selectedTraits.get("전사"), 1);

    const panelSource = await readFile(
      new URL(
        "../team-builder/components/TeamBuilderPanel.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(panelSource, /data-clear-active-tab-units/);
    assert.match(panelSource, /state\.clear/);
    assert.match(panelSource, /state\.selectedTraits\.size/);
  });

  test("trait-choice variants keep a localized suffix in all five locales", () => {
    const variant = {
      id: "TFT17_MissFortune_TFT17_Replicator",
      baseId: "TFT17_MissFortune",
      apiId: "TFT17_MissFortune",
      name: "미스 포츈 (복제자)",
      traits: [{ apiName: "TFT17_Replicator", name: "복제자", iconUrl: "" }],
    };
    const expected = {
      ko: "미스 포츈 (복제자)",
      en: "Miss Fortune (Replicator)",
      zh: "厄运小姐 (复制者)",
      zh_tw: "好運姐 (複製者)",
      ja: "ミス・フォーチュン (レプリケーター)",
    };
    for (const [locale, name] of Object.entries(expected)) {
      assert.equal(resolveLocalizedChampionName({
        champions: { TFT17_MissFortune: name.slice(0, name.lastIndexOf(" (")) },
        traits: { TFT17_Replicator: name.slice(name.lastIndexOf(" (") + 2, -1) },
        traitDescriptions: {},
      }, variant), name, locale);
    }
  });

  test("selector strategies keep candidate and fixed actions separated", () => {
    assert.equal(CHAMPION_SELECTOR_STRATEGIES.candidate.id, "candidate");
    assert.equal(CHAMPION_SELECTOR_STRATEGIES.fixed.id, "fixed");
    assert.equal(
      CHAMPION_SELECTOR_STRATEGIES.candidate.primaryOverlay,
      "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.62)_58%,rgba(255,255,255,0.22)_78%,rgba(255,255,255,0.06)_100%)]",
    );
    assert.equal(
      CHAMPION_SELECTOR_STRATEGIES.fixed.oppositeOverlay,
      CHAMPION_SELECTOR_STRATEGIES.candidate.primaryOverlay,
    );
    assert.match(
      CHAMPION_SELECTOR_STRATEGIES.fixed.primaryOverlay,
      /rgba\(225,29,72,0\.6\).*rgba\(225,29,72,0\.08\)/,
    );
    useSelectorModeStore.getState().setMode("fixed");
    assert.equal(useSelectorModeStore.getState().mode, "fixed");
  });

  test("leaving each search workspace clears only the departed query", () => {
    useSelectorModeStore.setState({
      mode: "candidate",
      selectorQueries: {
        candidate: "아리",
        fixed: "가렌",
        trait: "전사",
      },
    });

    useSelectorModeStore.getState().setMode("candidate");
    assert.equal(
      useSelectorModeStore.getState().selectorQueries.candidate,
      "아리",
    );

    useSelectorModeStore.getState().setMode("fixed");
    assert.deepEqual(useSelectorModeStore.getState().selectorQueries, {
      candidate: "",
      fixed: "가렌",
      trait: "전사",
    });

    useSelectorModeStore.getState().setMode("trait");
    assert.equal(useSelectorModeStore.getState().selectorQueries.fixed, "");
    assert.equal(useSelectorModeStore.getState().selectorQueries.trait, "전사");

    useSelectorModeStore.getState().setMode("result");
    assert.equal(useSelectorModeStore.getState().selectorQueries.trait, "");
  });

  test("cost toggles use the same baseId exclusion as the store action", () => {
    const fixedChampion = makeChampion("fixed", { baseId: "shared", cost: 1 });
    const derivedChampion = makeChampion("derived", {
      baseId: "shared",
      cost: 1,
    });
    const selectableChampion = makeChampion("selectable", { cost: 1 });
    const champions = [fixedChampion, derivedChampion, selectableChampion];

    assert.deepEqual(
      getSelectableChampionsByCost(champions, new Set([fixedChampion.id]), 1).map(
        (champion) => champion.id,
      ),
      [selectableChampion.id],
    );

    useTFTBuilderStore.setState({
      champions,
      selectedChampions: new Set(),
      fixedChampions: new Set([fixedChampion.id]),
    });
    useTFTBuilderStore.getState().toggleByCost(1);
    assert.deepEqual(
      [...useTFTBuilderStore.getState().selectedChampions],
      [selectableChampion.id],
    );
  });

  test("role toggles select and unselect every eligible role unit", async () => {
    const fixedFighter = makeChampion("fixed-fighter", {
      baseId: "shared-fighter",
      roles: ["physical-fighter"],
    });
    const fixedVariant = makeChampion("fixed-fighter-variant", {
      baseId: "shared-fighter",
      roles: ["magic-fighter"],
    });
    const physicalFighter = makeChampion("physical-fighter", {
      roles: ["physical-fighter"],
    });
    const magicFighter = makeChampion("magic-fighter", {
      roles: ["magic-fighter"],
    });
    const tank = makeChampion("role-toggle-tank", {
      roles: ["physical-tank"],
    });
    const ranged = makeChampion("role-toggle-ranged", {
      roles: ["magic-ranged"],
    });
    const assassin = makeChampion("role-toggle-assassin", {
      roles: ["magic-assassin"],
    });
    const champions = [
      fixedFighter,
      fixedVariant,
      physicalFighter,
      magicFighter,
      tank,
      ranged,
      assassin,
    ];

    assert.deepEqual(
      getSelectableChampionsByRole(
        champions,
        new Set([fixedFighter.id]),
        "fighter",
      ).map((champion) => champion.id),
      [physicalFighter.id, magicFighter.id],
    );
    assert.deepEqual(
      getSelectableChampionsByRole(champions, new Set(), "tank").map(
        (champion) => champion.id,
      ),
      [tank.id],
    );
    assert.deepEqual(
      getSelectableChampionsByRole(champions, new Set(), "ranged").map(
        (champion) => champion.id,
      ),
      [ranged.id],
    );
    assert.deepEqual(
      getSelectableChampionsByRole(champions, new Set(), "assassin").map(
        (champion) => champion.id,
      ),
      [assassin.id],
    );

    useTFTBuilderStore.setState({
      champions,
      selectedChampions: new Set([tank.id]),
      fixedChampions: new Set([fixedFighter.id]),
    });
    useTFTBuilderStore.getState().toggleByRole("fighter");
    assert.deepEqual(
      [...useTFTBuilderStore.getState().selectedChampions].sort(),
      [tank.id, physicalFighter.id, magicFighter.id].sort(),
    );

    useTFTBuilderStore.getState().toggleByRole("fighter");
    assert.deepEqual(
      [...useTFTBuilderStore.getState().selectedChampions],
      [tank.id],
    );

    const source = await readFile(
      new URL(
        "../selector/champion-selector/components/RoleToggleBar.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(source, /"fighter",\s*"tank",\s*"ranged",\s*"assassin"/);
    assert.match(source, /data-tft-role-toggle/);
    assert.match(source, /aria-pressed/);
  });

  test("guide copy supplies every visible section and both Chinese variants", () => {
    assert.deepEqual(
      GUIDE_LANGUAGE_OPTIONS.map((option) => option.id),
      ["ko", "en", "zh", "zh_tw", "ja"],
    );
    for (const copy of Object.values(GUIDE_LOCALES)) {
      assert.ok(copy.title.length > 0);
      assert.equal(copy.tools.length, 3);
      assert.equal(Object.keys(copy.workflow).length, 4);
      assert.equal(Object.keys(copy.sections).length, 5);
      assert.equal(copy.sections.navigation.points.length, 7);
      assert.equal(copy.sections.teamBuilder.points.length, 5);
      assert.equal(copy.sections.candidates.points.length, 5);
    }
    assert.match(
      GUIDE_LOCALES.ko.sections.candidates.description,
      /선택하지 않은 챔피언은 자동 추천에 나오지 않습니다/,
    );
    assert.match(GUIDE_LOCALES.en.sections.navigation.points.join(" "), /Team Builder/);
    assert.match(GUIDE_LOCALES.zh.sections.navigation.points.join(" "), /候选英雄/);
    assert.match(GUIDE_LOCALES.ja.sections.navigation.points.join(" "), /追加紋章/);
    assert.match(GUIDE_LOCALES.ko.sections.teamBuilder.points.join(" "), /작업 탭/);
    assert.match(GUIDE_LOCALES.en.sections.teamBuilder.points.join(" "), /work tab/);
    assert.match(GUIDE_LOCALES.zh.sections.teamBuilder.points.join(" "), /工作标签/);
    assert.match(GUIDE_LOCALES.ja.sections.teamBuilder.points.join(" "), /作業タブ/);
    assert.match(
      createBundledTranslationCatalog("zh_tw").guide.sections.teamBuilder.points.join(" "),
      /工作標籤/,
    );
    assert.equal(
      createBundledTranslationCatalog("zh_tw").app.tabs.candidate,
      "候選英雄",
    );
    assert.equal(
      createBundledTranslationCatalog("zh_tw").app.team.addRecommendationTab,
      "新增陣容標籤頁",
    );
  });

  test("app translations localize every workspace tab without bundling live TFT data", () => {
    for (const copy of Object.values(APP_LOCALES)) {
      assert.equal(Object.keys(copy.tabs).length, 5);
      assert.ok(copy.language.label.length > 0);
      assert.ok(copy.team.analyze.length > 0);
      assert.ok(copy.selector.loadFailed.length > 0);
    }
    for (const locale of ["ko", "en", "ja", "zh", "zh_tw"]) {
      assert.deepEqual(createBundledTranslationCatalog(locale).data, {
        champions: {},
        traits: {},
        traitDescriptions: {},
      });
    }
  });

  test("generated WordPress base catalogs contain UI copy but no seasonal TFT data", async () => {
    let generatedVersion = null;
    for (const locale of ["ko", "en", "ja", "zh", "zh_tw"]) {
      const payload = JSON.parse(
        await readFile(
          new URL(`../../../../translations/${locale}.json`, import.meta.url),
          "utf8",
        ),
      );
      const catalog = parseTranslationCatalog(payload, locale);
      generatedVersion ??= catalog.version;
      assert.equal(catalog.version, generatedVersion);
      assert.equal(catalog.version, "ui-catalog-v2");
      assert.ok(catalog.app.tabs.result.length > 0);
      assert.ok(catalog.app.selector.loadFailed.length > 0);
      assert.equal(catalog.guide.sections.teamBuilder.points.length, 5);
      assert.deepEqual(catalog.data, {
        champions: {},
        traits: {},
        traitDescriptions: {},
      });
    }
  });

  test("remote translation catalogs override known copy and retain bundled fallbacks", () => {
    const bundled = createBundledTranslationCatalog("en");
    const overriddenChampionId = "TFT17_REMOTE_CHAMPION";
    const traitId = "TFT17_REMOTE_TRAIT";
    const remote = {
      schemaVersion: 1,
      locale: "en",
      version: "admin-en-2026-07-23",
      updatedAt: "2026-07-23T01:00:00Z",
      app: {
        tabs: { result: "Remote Team Builder" },
      },
      guide: {
        title: "Remote Guide",
      },
      data: {
        champions: { [overriddenChampionId]: "Remote Champion" },
        traits: { [traitId]: "Remote Trait" },
        traitDescriptions: { [traitId]: "Remote description" },
      },
      roles: {
        "magic-ranged": "Remote Mage",
      },
      stats: {
        attackDamage: "Remote AD",
      },
    };
    const catalog = parseTranslationCatalog(remote, "en");

    assert.equal(catalog.app.tabs.result, "Remote Team Builder");
    assert.equal(catalog.app.tabs.candidate, APP_LOCALES.en.tabs.candidate);
    assert.equal(catalog.guide.title, "Remote Guide");
    assert.equal(catalog.guide.footer, GUIDE_LOCALES.en.footer);
    assert.equal(
      catalog.data.champions[overriddenChampionId],
      "Remote Champion",
    );
    assert.equal(catalog.data.traits[traitId], "Remote Trait");
    assert.equal(
      catalog.data.traitDescriptions[traitId],
      "Remote description",
    );
    assert.deepEqual(bundled.data.champions, {});
    assert.equal(catalog.roles["magic-ranged"], "Remote Mage");
    assert.equal(catalog.roles["physical-tank"], "Physical Tank");
    assert.equal(catalog.stats.attackDamage, "Remote AD");
    assert.equal(catalog.stats.health, "Health");
  });

  test("custom language catalogs retain English fallback structure and their own label", () => {
    const english = createBundledTranslationCatalog("en");
    const traitDescriptionId = "TFT17_CUSTOM_TRAIT";
    const catalog = parseTranslationCatalog(
      {
        ...english,
        locale: "fr",
        label: "Français",
        version: "admin-fr-1",
        app: { tabs: { candidate: "Champions" } },
        guide: {},
        data: {
          champions: {},
          traits: {},
          traitDescriptions: {
            [traitDescriptionId]: "Description française",
          },
        },
        roles: {},
        stats: {},
      },
      "fr",
    );
    assert.equal(catalog.label, "Français");
    assert.equal(catalog.app.tabs.candidate, "Champions");
    assert.equal(catalog.app.tabs.fixed, english.app.tabs.fixed);
    assert.equal(
      catalog.data.traitDescriptions[traitDescriptionId],
      "Description française",
    );
  });

  test("translation catalog rejects schema and locale mismatches", () => {
    const english = createBundledTranslationCatalog("en");
    assert.throws(
      () =>
        parseTranslationCatalog(
          { ...english, schemaVersion: 99 },
          "en",
        ),
      /지원하지 않는 번역 카탈로그 스키마/,
    );
    assert.throws(
      () => parseTranslationCatalog(english, "ja"),
      /요청한 언어와 번역 카탈로그 언어가 다릅니다/,
    );
  });

  test("language selection fetches one WordPress catalog and caches it", async () => {
    clearTranslationCatalogCache();
    const storage = new Map();
    globalThis.window = {
      location: { href: "https://app.example.test/" },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
      __TFT_APP_CONFIG__: {
        datasetUrl:
          "https://wordpress.example.test/wp-json/my-tft-app/v1/dataset?v=active",
        translationsUrl:
          "https://wordpress.example.test/wp-json/my-tft-app/v1/translations",
        schemaVersion: 1,
      },
    };
    const payload = JSON.parse(
      JSON.stringify(createBundledTranslationCatalog("en")),
    );
    payload.version = "wordpress-en-v2";
    payload.app.tabs.result = "Server Team Builder";
    let requestedUrl = "";
    globalThis.fetch = async (url) => {
      requestedUrl = String(url);
      return { ok: true, status: 200, json: async () => payload };
    };

    const catalog = await fetchTranslationCatalog("en");
    assert.equal(
      requestedUrl,
      "https://wordpress.example.test/wp-json/my-tft-app/v1/translations/en",
    );
    assert.equal(catalog.app.tabs.result, "Server Team Builder");
    assert.equal(
      readCachedTranslationCatalog("en").version,
      "wordpress-en-v2",
    );
    assert.equal(
      deriveTranslationsUrl(
        "https://wordpress.example.test/wp-json/my-tft-app/v1/dataset?v=active",
      ),
      "https://wordpress.example.test/wp-json/my-tft-app/v1/translations",
    );
  });

  test("champion search includes localized champion and trait names", () => {
    const champion = makeChampion("localized-search", {
      name: "미스 포츈",
      traits: [{ name: "기동총격여신", iconUrl: "" }],
    });
    const localizer = {
      championName: () => "Miss Fortune",
      traitName: () => "Gun Goddess",
    };
    assert.deepEqual(
      filterChampionsByQuery([champion], "fortune", localizer),
      [champion],
    );
    assert.deepEqual(
      filterChampionsByQuery([champion], "goddess", localizer),
      [champion],
    );
  });

  test("diagonal vertical gestures do not trigger horizontal tabs", () => {
    assert.equal(
      getAdjacentSwipeIndex({
        currentIndex: 2,
        itemCount: 5,
        deltaX: 80,
        deltaY: 60,
      }),
      2,
    );
    assert.equal(
      getAdjacentSwipeIndex({
        currentIndex: 2,
        itemCount: 5,
        deltaX: -110,
        deltaY: 70,
      }),
      3,
    );
  });

  test("device languages select the matching bundled locale", () => {
    assert.equal(resolveDeviceLocale(["en-US"]), "en");
    assert.equal(resolveDeviceLocale(["ja-JP"]), "ja");
    assert.equal(resolveDeviceLocale(["zh-Hans-CN"]), "zh");
    assert.equal(resolveDeviceLocale(["zh-TW"]), "zh_tw");
    assert.equal(resolveDeviceLocale(["zh-Hant-HK"]), "zh_tw");
    assert.equal(resolveDeviceLocale(["de-DE"]), "en");
    assert.equal(resolveDeviceLocale(["fr-FR"]), "en");
    assert.equal(resolveDeviceLocale(["fr-FR", "ko-KR"]), "ko");
  });

  test("device languages select server-provided custom locales", () => {
    assert.equal(
      resolveDeviceLocale(["fr-FR"], ["ko", "en", "fr"]),
      "fr",
    );
    assert.equal(
      resolveDeviceLocale(["pt-BR"], ["ko", "en", "pt_br"]),
      "pt_br",
    );
    assert.equal(
      resolveDeviceLocale(["de-DE"], ["ko", "en", "fr"]),
      "en",
    );
  });

  test("selector lists progressively mount items for each viewport", async () => {
    const championGrid = await readFile(
      new URL("../selector/champion-selector/components/ChampionGrid.tsx", import.meta.url),
      "utf8",
    );
    const traitSelector = await readFile(
      new URL("../selector/fixed-trait-selector/components/FixedTraitSelector.tsx", import.meta.url),
      "utf8",
    );
    const progressiveHook = await readFile(
      new URL("../selector/hooks/useProgressiveRenderCount.ts", import.meta.url),
      "utf8",
    );
    assert.equal(getProgressivePageSize(CHAMPION_PROGRESSIVE_PROFILE, 375), 8);
    assert.equal(getProgressivePageSize(CHAMPION_PROGRESSIVE_PROFILE, 768), 12);
    assert.equal(getProgressivePageSize(CHAMPION_PROGRESSIVE_PROFILE, 1440), 18);
    assert.equal(getProgressivePageSize(TRAIT_PROGRESSIVE_PROFILE, 375), 6);
    assert.equal(getProgressivePageSize(TRAIT_PROGRESSIVE_PROFILE, 768), 10);
    assert.equal(getProgressivePageSize(TRAIT_PROGRESSIVE_PROFILE, 1440), 14);
    assert.match(championGrid, /filtered\.slice\(0, renderCount\)/);
    assert.match(traitSelector, /filtered\.slice\(0, renderCount\)/);
    assert.match(championGrid, /data-progressive-render-sentinel/);
    assert.match(traitSelector, /data-progressive-render-sentinel/);
    assert.match(progressiveHook, /IntersectionObserver/);
    assert.match(progressiveHook, /window\.addEventListener\("scroll"/);
    assert.match(championGrid, /\[content-visibility:auto\]/);
    assert.match(traitSelector, /\[content-visibility:auto\]/);
  });

  test("language selector native control covers the complete visible control", async () => {
    const source = await readFile(
      new URL("../i18n/LanguageSelector.tsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /absolute inset-0 z-10 h-full w-full/);
    assert.match(source, /selectedLanguage\?\.label/);
  });

  test("workspace keeps visited panels mounted and skips inactive painting", async () => {
    const carouselHook = await readFile(
      new URL("../workspace/hooks/useWorkspaceCarousel.ts", import.meta.url),
      "utf8",
    );
    const workspace = await readFile(
      new URL("../workspace/TftWorkspace.tsx", import.meta.url),
      "utf8",
    );
    assert.match(carouselHook, /waitForScrollSettle/);
    assert.match(carouselHook, /setMountedModes/);
    assert.match(carouselHook, /nextModes\.add\(targetMode\)/);
    assert.match(carouselHook, /requestAnimationFrame/);
    assert.match(workspace, /\[content-visibility:hidden\]/);
    assert.match(workspace, /isMounted=\{mountedModes\.has\("fixed"\)\}/);
    assert.equal(getWorkspaceNavigationBehavior(375), "auto");
    assert.equal(getWorkspaceNavigationBehavior(768), "smooth");
    assert.equal(getWorkspaceNavigationBehavior(1440, true), "auto");
    assert.match(workspace, /min-width: 640px/);
  });

  test("production client source has no direct external dataset URL or evaluator", async () => {
    const apiSource = await readFile(
      new URL("../api/tftApi.ts", import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(apiSource, /https:\/\/raw\.communitydragon\.org/);
    assert.doesNotMatch(apiSource, /evaluateStaticPower|attachStaticPowerResults/);
  });

  test("Capacitor sync uses the current WordPress plugin build", async () => {
    const capacitorConfig = await readFile(
      new URL("../../../capacitor.config.ts", import.meta.url),
      "utf8",
    );
    const packageJson = await readFile(
      new URL("../../../package.json", import.meta.url),
      "utf8",
    );
    const androidRuntimeCheck = await readFile(
      new URL(
        "../../../scripts/verify-android-runtime-config.mjs",
        import.meta.url,
      ),
      "utf8",
    );
    const androidSync = await readFile(
      new URL("../../../scripts/android-sync.mjs", import.meta.url),
      "utf8",
    );
    assert.match(capacitorConfig, /webDir:\s*["']\.\.\/dist["']/);
    assert.match(packageJson, /"android:sync"/);
    assert.match(packageJson, /"android:bundle"/);
    assert.doesNotMatch(packageJson, /"android:sync:en"/);
    assert.match(androidSync, /verify-android-runtime-config/);
    assert.match(androidSync, /verify-android-localization/);
    assert.match(androidRuntimeCheck, /VITE_TFT_DATASET_URL/);
    assert.match(androidRuntimeCheck, /VITE_TFT_ASSET_BASE_URL/);
    assert.match(androidRuntimeCheck, /VITE_TFT_TRANSLATIONS_URL/);
    assert.match(packageJson, /translations:generate/);
  });

  test("Android requests and resumes Google Play immediate updates", async () => {
    const androidBuild = await readFile(
      new URL("../../../android/app/build.gradle", import.meta.url),
      "utf8",
    );
    const mainActivity = await readFile(
      new URL(
        "../../../android/app/src/main/java/com/UrsusCertamen/TFTool/MainActivity.java",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(androidBuild, /com\.google\.android\.play:app-update:2\.1\.0/);
    assert.match(mainActivity, /UpdateAvailability\.UPDATE_AVAILABLE/);
    assert.match(mainActivity, /AppUpdateType\.IMMEDIATE/);
    assert.match(
      mainActivity,
      /UpdateAvailability\.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS/,
    );
    assert.match(mainActivity, /startUpdateFlowForResult/);
  });

  test("translation maintenance refreshes names without administrator overrides", async () => {
    const updater = await readFile(
      new URL("../../../scripts/update-trait-description-locales.mjs", import.meta.url),
      "utf8",
    );
    const wordpressTranslations = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-translations.php",
        import.meta.url,
      ),
      "utf8",
    );
    const wordpressSync = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-sync-service.php",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(updater, /tftDataLocales\.ts/);
    assert.match(updater, /champion names/);
    assert.match(updater, /trait names\/descriptions/);
    assert.match(wordpressTranslations, /update_runtime_data/);
    assert.match(wordpressTranslations, /Legacy administrator-uploaded catalogs are intentionally ignored/);
    assert.doesNotMatch(wordpressTranslations, /save_catalog_json/);
    assert.match(wordpressSync, /POST_SYNC_HOOK/);
    assert.match(wordpressSync, /run_post_sync_step/);
    assert.match(wordpressSync, /queue_post_sync_jobs/);
    assert.match(wordpressSync, /array\(\$locale\),\s*1/);
    assert.match(wordpressSync, /register_failure_shutdown_handler/);
    assert.match(wordpressSync, /LOCALIZATION_LOCALES/);
    assert.match(wordpressSync, /same-source-hash[\s\S]*postSync/);
    assert.match(wordpressSync, /tft_source_dns_failure/);
    assert.match(wordpressSync, /schedule_dns_retry/);
  });

  test("WordPress sync progress reflects real phases and verifies both source bodies", async () => {
    const wordpressSync = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-sync-service.php",
        import.meta.url,
      ),
      "utf8",
    );
    const normalizer = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-dataset-normalizer.php",
        import.meta.url,
      ),
      "utf8",
    );
    const admin = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-admin.php",
        import.meta.url,
      ),
      "utf8",
    );

    assert.match(wordpressSync, /SYNC_PROGRESS_OPTION/);
    assert.match(wordpressSync, /\$full_source_verification\s*=\s*true/);
    assert.match(wordpressSync, /전체 원본 검증 요청에 HTTP 304/);
    assert.match(wordpressSync, /compare_payloads/);
    assert.match(wordpressSync, /full-composite-hash/);
    assert.match(wordpressSync, /reactivated-existing/);
    assert.match(normalizer, /progress_callback/);
    assert.match(normalizer, /'trait_assets'/);
    assert.match(normalizer, /'champion_assets'/);
    assert.match(normalizer, /'op_calculation'/);
    assert.match(normalizer, /'op_complete'/);
    assert.match(admin, /현재 동기화 진행 상태/);
    assert.match(admin, /판정 근거/);
    assert.match(admin, /챔피언 이름·특성 이름·특성 설명/);
    assert.match(admin, /5분 넘게 진행 기록이 갱신되지 않았습니다/);
  });

  test("daily server sync and app lifecycle refresh cover live seasonal data", async () => {
    const wordpressSync = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-sync-service.php",
        import.meta.url,
      ),
      "utf8",
    );
    const normalizer = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-dataset-normalizer.php",
        import.meta.url,
      ),
      "utf8",
    );
    const runtimeRefresh = await readFile(
      new URL(
        "../workspace/hooks/useRuntimeDataRefresh.ts",
        import.meta.url,
      ),
      "utf8",
    );
    const workspace = await readFile(
      new URL("../workspace/TftWorkspace.tsx", import.meta.url),
      "utf8",
    );
    const appI18n = await readFile(
      new URL("../i18n/AppI18n.tsx", import.meta.url),
      "utf8",
    );

    assert.match(wordpressSync, /\$scheduled_refresh\s*=\s*\$trigger_type\s*===\s*'scheduled'/);
    assert.match(
      wordpressSync,
      /\$force\s*\|\|\s*\$rules_changed\s*\|\|\s*\$scheduled_refresh/,
    );
    assert.match(
      wordpressSync,
      /!\$scheduled_refresh[\s\S]*same-source-hash/,
    );
    assert.match(wordpressSync, /new TFT_Builder_Image_Mirror\(/);
    assert.match(wordpressSync, /array_keys\(self::LOCALIZATION_LOCALES\)/);
    assert.match(wordpressSync, /POST_SYNC_MAX_ATTEMPTS/);
    assert.match(wordpressSync, /select_localized_set/);
    assert.match(normalizer, /select_compatible_set/);
    assert.match(normalizer, /matchedChampions/);
    assert.doesNotMatch(normalizer, /\$set_id\s*=\s*\(string\)\s*max\(/);
    assert.match(workspace, /useRuntimeDataRefresh\(\)/);
    assert.match(runtimeRefresh, /fetchAll\(\)/);
    assert.match(runtimeRefresh, /refreshAll\(\)/);
    assert.match(runtimeRefresh, /visibilitychange/);
    assert.match(runtimeRefresh, /window\.addEventListener\("focus"/);
    assert.match(runtimeRefresh, /window\.addEventListener\("online"/);
    assert.match(appI18n, /fetchTranslationCatalog\(locale\)/);
    assert.doesNotMatch(appI18n, /fetchTranslationLanguageOptions/);
    assert.match(appI18n, /languageOptions: GUIDE_LANGUAGE_OPTIONS/);
    assert.match(appI18n, /visibilitychange/);
  });

  test("WordPress shop roster keeps valid special units and exposes lock recovery", async () => {
    const normalizer = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-dataset-normalizer.php",
        import.meta.url,
      ),
      "utf8",
    );
    const syncService = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-sync-service.php",
        import.meta.url,
      ),
      "utf8",
    );
    const admin = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-admin.php",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(normalizer, /team_planner_code/);
    assert.match(normalizer, /shopChampionCount/);
    assert.match(normalizer, /array\('squareIcon', 'tileIcon', 'icon'\)/);
    assert.doesNotMatch(normalizer, /minion\|summon\|clone/);
    assert.doesNotMatch(normalizer, /canonical_names/);
    assert.match(syncService, /clear_lock/);
    assert.match(syncService, /acquired_at/);
    assert.match(admin, /고착 잠금 해제/);
  });

  test("WordPress OP roles use external data, dynamic overrides, and automatic inference", async () => {
    const normalizer = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-dataset-normalizer.php",
        import.meta.url,
      ),
      "utf8",
    );
    const runtimeSettings = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-runtime-settings.php",
        import.meta.url,
      ),
      "utf8",
    );
    const admin = await readFile(
      new URL(
        "../../../../includes/class-tft-builder-admin.php",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(runtimeSettings, /roleOverrides/);
    assert.match(runtimeSettings, /physical-ranged/);
    assert.match(runtimeSettings, /assassinBonus/);
    assert.match(normalizer, /infer_role_from_same_cost_range_peers/);
    assert.match(normalizer, /role_peers_for_attack_range_delta/);
    assert.match(normalizer, /Same-cost attack-range peer automatic role inference/);
    assert.match(normalizer, /shop-roster-v10-external-auto-overrides/);
    assert.match(normalizer, /median_star_stat/);
    assert.doesNotMatch(normalizer, /roleFallbacks/);
    assert.doesNotMatch(runtimeSettings, /roleFallbacks/);
    assert.match(normalizer, /!empty\(\$champion\['roles'\]\) \|\| !isset\(\$overrides\[\$base_id\]\)/);
    assert.match(normalizer, /is_complete_baseline/);
    assert.match(normalizer, /WordPress administrator role override/);
    assert.match(admin, /외부 역할 누락·자동 판정 오버라이드/);
    assert.match(admin, /동일 코스트·동일 공격 사거리를 먼저 비교/);
    assert.match(admin, /판정 근거/);
    assert.match(admin, /자동 · 동일 코스트\/사거리/);
    assert.doesNotMatch(admin, /foreach \(\$overrides as \$base_id => \$role\)/);
    assert.match(admin, /암살자 유닛 가산점/);
    assert.match(admin, /자동 판정 사용 \/ 불가능하면 미지정/);
  });

  test("WordPress button isolation covers result cards and stateful controls", async () => {
    const css = await readFile(
      new URL("../styles/wordpressButtonIsolation.css", import.meta.url),
      "utf8",
    );
    const workspace = await readFile(
      new URL("../workspace/TftWorkspace.tsx", import.meta.url),
      "utf8",
    );
    assert.match(css, /data-result-champion-detail-trigger/);
    assert.match(css, /data-result-champion-remove/);
    assert.match(css, /data-champion-info-trigger/);
    assert.match(css, /data-tft-cost-toggle/);
    assert.match(css, /data-tft-shuffle-toggle/);
    assert.match(workspace, /wordpressButtonIsolation\.css/);
  });

  test("result champion cards remove units from their original selection", async () => {
    const resultCard = await readFile(
      new URL(
        "../team-builder/components/team-result-card/TeamResultCard.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    const championItem = await readFile(
      new URL(
        "../team-builder/components/team-result-card/ChampionItem.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(resultCard, /state\.toggleFixed/);
    assert.match(resultCard, /state\.toggle/);
    assert.match(resultCard, /onRemove=\{removeFixed\}/);
    assert.match(resultCard, /onRemove=\{removeCandidate\}/);
    assert.match(championItem, /data-result-champion-remove/);
    assert.match(championItem, /onRemove\(champion\.id\)/);
  });

  for (const { name, run } of tests) {
    await run();
    console.log(`PASS ${name}`);
  }
  console.log(`\n${tests.length} tests passed.`);
} finally {
  await vite.close();
}
