import type { BundledGuideLocale } from "../workspace/guide/guideLocales";

export interface SelectorLocaleCopy {
  readonly sectionTitle: string;
  readonly countLabel: string;
  readonly clearAll: string;
  readonly clearAllAria: string;
  readonly searchPlaceholder: string;
  readonly listLabel: string;
  readonly currentSelectionLabel: string;
  readonly oppositeSelectionLabel: string;
}

export interface AppLocaleCopy {
  readonly tabs: {
    readonly intro: string;
    readonly result: string;
    readonly candidate: string;
    readonly fixed: string;
    readonly trait: string;
  };
  readonly workspaceLabel: string;
  readonly language: {
    readonly label: string;
    readonly shortLabel: string;
  };
  readonly team: {
    readonly sectionTitle: string;
    readonly teamSize: string;
    readonly teamSizeAria: string;
    readonly shuffle: string;
    readonly shuffleOn: string;
    readonly shuffleOff: string;
    readonly analyze: string;
    readonly analyzing: string;
    readonly staleResults: string;
    readonly emptyResults: string;
    readonly fixedUnits: string;
    readonly recommendedUnits: string;
    readonly applyAsFixed: string;
    readonly score: string;
    readonly recommendationTabsLabel: string;
    readonly recommendationTab: string;
    readonly addRecommendationTab: string;
    readonly closeRecommendationTab: string;
    readonly recommendationTabLimit: string;
    readonly copyRecommendationTab: string;
    readonly copyRecommendationTabAria: string;
    readonly clearTabUnits: string;
    readonly clearTabUnitsAria: string;
  };
  readonly selector: {
    readonly candidate: SelectorLocaleCopy;
    readonly fixed: SelectorLocaleCopy;
    readonly loading: string;
    readonly loadFailed: string;
    readonly noMatches: string;
    readonly removeSelection: string;
    readonly select: string;
    readonly unselect: string;
    readonly costAll: string;
    readonly roleGroups: {
      readonly fighter: string;
      readonly tank: string;
      readonly ranged: string;
      readonly assassin: string;
    };
    readonly development: {
      readonly originLabel: string;
      readonly originPlaceholder: string;
      readonly connect: string;
      readonly saveFailed: string;
    };
  };
  readonly traits: {
    readonly title: string;
    readonly selected: string;
    readonly controlsHint: string;
    readonly searchPlaceholder: string;
    readonly searchAria: string;
    readonly reset: string;
    readonly resetAria: string;
    readonly listLabel: string;
    readonly decrease: string;
    readonly increase: string;
  };
  readonly detail: {
    readonly comparisonInfo: string;
    readonly close: string;
    readonly championInfo: string;
    readonly traitInfo: string;
    readonly role: string;
    readonly baseline: string;
    readonly candidate: string;
    readonly difference: string;
    readonly cost: string;
    readonly primaryRole: string;
    readonly secondaryRole: string;
    readonly traits: string;
    readonly noTraits: string;
    readonly starStats: string;
    readonly stat: string;
    readonly noStats: string;
    readonly totalCount: string;
    readonly activeTier: string;
    readonly nextTier: string;
    readonly maxTier: string;
    readonly needed: string;
    readonly none: string;
    readonly extraEmblems: string;
    readonly currentEffect: string;
    readonly traitChampions: string;
    readonly emblemOnly: string;
    readonly breakpoints: string;
  };
  readonly common: {
    readonly cost: string;
    readonly compactCost: string;
    readonly star: string;
    readonly people: string;
    readonly selected: string;
    readonly tier: string;
  };
}

export const APP_LOCALES = {
  ko: {
    tabs: { intro: "가이드", result: "조합 추천", candidate: "후보 유닛", fixed: "고정 유닛", trait: "추가 상징" },
    workspaceLabel: "TFT 조합 도구 작업 영역",
    language: { label: "앱 언어 선택", shortLabel: "언어" },
    team: {
      sectionTitle: "팀 조합 추천", teamSize: "인원 수", teamSizeAria: "추천 팀 인원 수",
      shuffle: "후보 순서 섞기", shuffleOn: "ON · 동점 후보의 탐색·결과 순서 변경", shuffleOff: "OFF · 결정적 결과 유지",
      analyze: "최적 팀 구성 →", analyzing: "조합 분석 중...", staleResults: "추천 조건이 변경되었습니다. 다시 분석해 주세요.",
      emptyResults: "최적의 팀 결과가 여기에 표시됩니다.", fixedUnits: "고정 유닛", recommendedUnits: "추천 유닛",
      applyAsFixed: "고정 유닛으로 적용", score: "팀 점수",
      recommendationTabsLabel: "추천 작업 하위 탭", recommendationTab: "추천 {number}",
      addRecommendationTab: "새 추천 탭 추가", closeRecommendationTab: "탭 닫기", recommendationTabLimit: "추가할 수 있는 추천 탭 수에 도달했습니다.",
      copyRecommendationTab: "선택 복사", copyRecommendationTabAria: "현재 추천 탭의 선택을 새 탭으로 복사",
      clearTabUnits: "선택 전체 초기화", clearTabUnitsAria: "현재 추천 탭의 후보 유닛, 고정 유닛 및 추가 상징 전체 초기화",
    },
    selector: {
      candidate: { sectionTitle: "후보 유닛 선택", countLabel: "후보 카드 수", clearAll: "전체 삭제", clearAllAria: "후보 유닛 전체 선택 해제", searchPlaceholder: "후보 챔피언 검색", listLabel: "후보 유닛 목록", currentSelectionLabel: "후보 유닛", oppositeSelectionLabel: "고정 유닛" },
      fixed: { sectionTitle: "고정 유닛 선택", countLabel: "고정 카드 수", clearAll: "전체 삭제", clearAllAria: "고정 유닛 전체 선택 해제", searchPlaceholder: "고정 챔피언 검색", listLabel: "고정 유닛 목록", currentSelectionLabel: "고정 유닛", oppositeSelectionLabel: "후보 유닛" },
      loading: "유닛 데이터를 불러오는 중...", loadFailed: "유닛 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", noMatches: "검색 조건에 맞는 유닛이 없습니다.", removeSelection: "선택 해제", select: "선택", unselect: "선택 해제", costAll: "전체",
      roleGroups: { fighter: "전사", tank: "탱커", ranged: "원거리", assassin: "암살자" },
      development: { originLabel: "개발용 워드프레스 주소", originPlaceholder: "https://wordpress.example.com", connect: "개발 서버 연결", saveFailed: "개발용 워드프레스 주소를 저장하지 못했습니다." },
    },
    traits: { title: "추가 상징", selected: "선택 중", controlsHint: "+/- 버튼으로 수치 조절", searchPlaceholder: "특성 검색", searchAria: "추가 상징 검색", reset: "초기화", resetAria: "선택한 추가 상징 전체 초기화", listLabel: "추가 상징 목록", decrease: "수량 줄이기", increase: "수량 늘리기" },
    detail: { comparisonInfo: "비교 정보", close: "상세 정보 닫기", championInfo: "챔피언 상세 정보", traitInfo: "현재 추천 조합의 활성 특성 정보", role: "판정 역할", baseline: "기준", candidate: "후보", difference: "차이", cost: "코스트", primaryRole: "주 역할", secondaryRole: "보조 역할", traits: "특성", noTraits: "표시할 특성 없음", starStats: "별 등급별 전투 스탯", stat: "스탯", noStats: "제공된 전투 스탯이 없습니다.", totalCount: "전체 수량", activeTier: "활성 단계", nextTier: "다음 단계", maxTier: "최고 단계", needed: "추가 필요", none: "없음", extraEmblems: "추가 상징", currentEffect: "현재 효과", traitChampions: "특성 제공 챔피언", emblemOnly: "추가 상징으로만 활성화됨", breakpoints: "특성 단계" },
    common: { cost: "코스트", compactCost: "코", star: "성", people: "명", selected: "선택됨", tier: "단계" },
  },
  en: {
    tabs: { intro: "Guide", result: "Team Builder", candidate: "Champions", fixed: "Must-use", trait: "Emblems" },
    workspaceLabel: "TFT team optimizer workspace",
    language: { label: "Choose app language", shortLabel: "Language" },
    team: {
      sectionTitle: "Team Builder", teamSize: "Team size", teamSizeAria: "Suggested team size",
      shuffle: "Shuffle candidate order", shuffleOn: "ON · changes tie exploration and result order", shuffleOff: "OFF · keeps repeatable results",
      analyze: "Build best team →", analyzing: "Building team...", staleResults: "Your choices changed. Build the team again.",
      emptyResults: "Your suggested teams will appear here.", fixedUnits: "Must-use", recommendedUnits: "Recommended",
      applyAsFixed: "Use as must-use", score: "TEAM SCORE",
      recommendationTabsLabel: "Recommendation work tabs", recommendationTab: "Build {number}",
      addRecommendationTab: "Add recommendation tab", closeRecommendationTab: "Close tab", recommendationTabLimit: "You have reached the recommendation tab limit.",
      copyRecommendationTab: "Copy choices", copyRecommendationTabAria: "Copy the current recommendation tab choices to a new tab",
      clearTabUnits: "Clear all choices", clearTabUnitsAria: "Clear all candidate champions, must-use champions, and extra emblems in the current recommendation tab",
    },
    selector: {
      candidate: { sectionTitle: "Pick champions", countLabel: "Chosen champions", clearAll: "Clear all", clearAllAria: "Clear all chosen champions", searchPlaceholder: "Search champions", listLabel: "Champion list", currentSelectionLabel: "Chosen champions", oppositeSelectionLabel: "Must-use champions" },
      fixed: { sectionTitle: "Pick must-use champions", countLabel: "Must-use champions", clearAll: "Clear all", clearAllAria: "Clear all must-use champions", searchPlaceholder: "Search must-use champions", listLabel: "Must-use champion list", currentSelectionLabel: "Must-use champions", oppositeSelectionLabel: "Chosen champions" },
      loading: "Loading champion data...", loadFailed: "Champion data could not be loaded. Please try again shortly.", noMatches: "No champions match your search.", removeSelection: "Remove", select: "Select", unselect: "Unselect", costAll: "all",
      roleGroups: { fighter: "Fighter", tank: "Tank", ranged: "Ranged", assassin: "Assassin" },
      development: { originLabel: "Development WordPress address", originPlaceholder: "https://wordpress.example.com", connect: "Connect development server", saveFailed: "Could not save the development WordPress address." },
    },
    traits: { title: "Extra emblems", selected: "selected", controlsHint: "Use - and + to change the count", searchPlaceholder: "Search traits", searchAria: "Search extra emblems", reset: "Reset", resetAria: "Reset all extra emblems", listLabel: "Extra emblem list", decrease: "Decrease count", increase: "Increase count" },
    detail: { comparisonInfo: "Comparison", close: "Close details", championInfo: "Champion details", traitInfo: "Active trait details for this team", role: "Role", baseline: "Baseline", candidate: "Candidate", difference: "Difference", cost: "Cost", primaryRole: "Primary role", secondaryRole: "Secondary role", traits: "Traits", noTraits: "No traits to show", starStats: "Stats by star level", stat: "Stat", noStats: "No combat stats were provided.", totalCount: "Total count", activeTier: "Active tier", nextTier: "Next tier", maxTier: "Highest tier", needed: "Needed", none: "None", extraEmblems: "Extra emblems", currentEffect: "Current effect", traitChampions: "Trait champions", emblemOnly: "Activated by extra emblems only", breakpoints: "Breakpoints" },
    common: { cost: "cost", compactCost: "c", star: "star", people: "units", selected: "selected", tier: "tier" },
  },
  zh: {
    tabs: { intro: "指南", result: "阵容推荐", candidate: "候选英雄", fixed: "必选英雄", trait: "额外纹章" },
    workspaceLabel: "TFT 阵容推荐工具",
    language: { label: "选择应用语言", shortLabel: "语言" },
    team: {
      sectionTitle: "阵容推荐", teamSize: "队伍人数", teamSizeAria: "推荐队伍人数",
      shuffle: "打乱候选顺序", shuffleOn: "开启 · 改变同分候选的搜索和结果顺序", shuffleOff: "关闭 · 保持可重复的结果",
      analyze: "生成最佳阵容 →", analyzing: "正在生成阵容...", staleResults: "选择已改变，请重新生成阵容。",
      emptyResults: "推荐阵容会显示在这里。", fixedUnits: "必选英雄", recommendedUnits: "推荐英雄",
      applyAsFixed: "设为必选", score: "阵容分数",
      recommendationTabsLabel: "阵容推荐子标签页", recommendationTab: "阵容 {number}",
      addRecommendationTab: "新增阵容标签页", closeRecommendationTab: "关闭标签页", recommendationTabLimit: "已达到阵容标签页数量上限。",
      copyRecommendationTab: "复制选择", copyRecommendationTabAria: "将当前阵容标签页的选择复制到新标签页",
      clearTabUnits: "重置全部选择", clearTabUnitsAria: "重置当前阵容标签页中的全部候选英雄、必选英雄和额外纹章",
    },
    selector: {
      candidate: { sectionTitle: "选择候选英雄", countLabel: "已选英雄", clearAll: "全部清除", clearAllAria: "清除全部候选英雄", searchPlaceholder: "搜索英雄", listLabel: "候选英雄列表", currentSelectionLabel: "候选英雄", oppositeSelectionLabel: "必选英雄" },
      fixed: { sectionTitle: "选择必选英雄", countLabel: "必选英雄", clearAll: "全部清除", clearAllAria: "清除全部必选英雄", searchPlaceholder: "搜索必选英雄", listLabel: "必选英雄列表", currentSelectionLabel: "必选英雄", oppositeSelectionLabel: "候选英雄" },
      loading: "正在加载英雄数据...", loadFailed: "无法加载英雄数据，请稍后重试。", noMatches: "没有符合搜索条件的英雄。", removeSelection: "取消选择", select: "选择", unselect: "取消选择", costAll: "全部",
      roleGroups: { fighter: "战士", tank: "坦克", ranged: "远程", assassin: "刺客" },
      development: { originLabel: "开发用 WordPress 地址", originPlaceholder: "https://wordpress.example.com", connect: "连接开发服务器", saveFailed: "无法保存开发用 WordPress 地址。" },
    },
    traits: { title: "额外纹章", selected: "已选择", controlsHint: "使用 +/- 调整数量", searchPlaceholder: "搜索特性", searchAria: "搜索额外纹章", reset: "重置", resetAria: "重置全部额外纹章", listLabel: "额外纹章列表", decrease: "减少数量", increase: "增加数量" },
    detail: { comparisonInfo: "比较信息", close: "关闭详情", championInfo: "英雄详情", traitInfo: "当前阵容的激活特性信息", role: "判定定位", baseline: "基准", candidate: "候选", difference: "差值", cost: "费用", primaryRole: "主要定位", secondaryRole: "辅助定位", traits: "特性", noTraits: "没有可显示的特性", starStats: "各星级战斗数值", stat: "数值", noStats: "没有提供战斗数值。", totalCount: "总数量", activeTier: "当前阶段", nextTier: "下一阶段", maxTier: "最高阶段", needed: "还需", none: "无", extraEmblems: "额外纹章", currentEffect: "当前效果", traitChampions: "提供特性的英雄", emblemOnly: "仅通过额外纹章激活", breakpoints: "特性阶段" },
    common: { cost: "费", compactCost: "费", star: "星", people: "个", selected: "已选择", tier: "阶段" },
  },
  ja: {
    tabs: { intro: "ガイド", result: "チーム提案", candidate: "候補", fixed: "必須", trait: "追加紋章" },
    workspaceLabel: "TFT チーム最適化ツール",
    language: { label: "アプリの言語を選ぶ", shortLabel: "言語" },
    team: {
      sectionTitle: "チーム提案", teamSize: "チーム人数", teamSizeAria: "おすすめチームの人数",
      shuffle: "候補順をシャッフル", shuffleOn: "ON · 同点候補の探索と結果順を変えます", shuffleOff: "OFF · 再現できる結果を保ちます",
      analyze: "最適チームを作る →", analyzing: "チームを分析中...", staleResults: "選択が変わりました。もう一度チームを作ってください。",
      emptyResults: "おすすめチームがここに表示されます。", fixedUnits: "必須チャンピオン", recommendedUnits: "おすすめチャンピオン",
      applyAsFixed: "必須にする", score: "チームスコア",
      recommendationTabsLabel: "チーム提案のサブタブ", recommendationTab: "提案 {number}",
      addRecommendationTab: "提案タブを追加", closeRecommendationTab: "タブを閉じる", recommendationTabLimit: "追加できる提案タブの上限に達しました。",
      copyRecommendationTab: "選択をコピー", copyRecommendationTabAria: "現在の提案タブの選択を新しいタブにコピー",
      clearTabUnits: "選択をすべてリセット", clearTabUnitsAria: "現在の提案タブの候補、必須チャンピオン、追加紋章をすべてリセット",
    },
    selector: {
      candidate: { sectionTitle: "候補を選ぶ", countLabel: "選んだ候補", clearAll: "すべて消す", clearAllAria: "選んだ候補をすべて消す", searchPlaceholder: "チャンピオンを探す", listLabel: "候補チャンピオン一覧", currentSelectionLabel: "候補チャンピオン", oppositeSelectionLabel: "必須チャンピオン" },
      fixed: { sectionTitle: "必須を選ぶ", countLabel: "必須チャンピオン", clearAll: "すべて消す", clearAllAria: "必須チャンピオンをすべて消す", searchPlaceholder: "必須チャンピオンを探す", listLabel: "必須チャンピオン一覧", currentSelectionLabel: "必須チャンピオン", oppositeSelectionLabel: "候補チャンピオン" },
      loading: "チャンピオンデータを読み込み中...", loadFailed: "チャンピオンデータを読み込めませんでした。しばらくしてからもう一度お試しください。", noMatches: "検索に合うチャンピオンがいません。", removeSelection: "選択解除", select: "選ぶ", unselect: "選択解除", costAll: "すべて",
      roleGroups: { fighter: "ファイター", tank: "タンク", ranged: "遠隔", assassin: "アサシン" },
      development: { originLabel: "開発用 WordPress アドレス", originPlaceholder: "https://wordpress.example.com", connect: "開発サーバーに接続", saveFailed: "開発用 WordPress アドレスを保存できませんでした。" },
    },
    traits: { title: "追加紋章", selected: "選択中", controlsHint: "+/- ボタンで数を調整", searchPlaceholder: "特性を探す", searchAria: "追加紋章を探す", reset: "リセット", resetAria: "追加紋章をすべてリセット", listLabel: "追加紋章一覧", decrease: "数を減らす", increase: "数を増やす" },
    detail: { comparisonInfo: "比較情報", close: "詳細を閉じる", championInfo: "チャンピオン詳細", traitInfo: "このチームで有効な特性の詳細", role: "判定ロール", baseline: "基準", candidate: "候補", difference: "差", cost: "コスト", primaryRole: "主なロール", secondaryRole: "補助ロール", traits: "特性", noTraits: "表示する特性はありません", starStats: "星ごとの戦闘ステータス", stat: "ステータス", noStats: "戦闘ステータスはありません。", totalCount: "合計数", activeTier: "有効段階", nextTier: "次の段階", maxTier: "最高段階", needed: "あと必要", none: "なし", extraEmblems: "追加紋章", currentEffect: "現在の効果", traitChampions: "特性を持つチャンピオン", emblemOnly: "追加紋章だけで有効化", breakpoints: "ブレークポイント" },
    common: { cost: "コスト", compactCost: "コ", star: "星", people: "人", selected: "選択中", tier: "段階" },
  },
} as const satisfies Readonly<Record<BundledGuideLocale, AppLocaleCopy>>;
