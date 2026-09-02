export type BundledGuideLocale = "ko" | "en" | "zh" | "ja";
export type GuideLocale = string;

export type GuideWorkflowId = "choose" | "required" | "recommend" | "save";

export type GuideSectionId =
  | "navigation"
  | "teamBuilder"
  | "candidates"
  | "fixed"
  | "traits";

interface GuideWorkflowCopy {
  readonly title: string;
  readonly detail: string;
}

interface GuideSectionCopy {
  readonly title: string;
  readonly label: string;
  readonly description: string;
  readonly points: readonly string[];
}

export interface GuideCopy {
  readonly languageSelectorLabel: string;
  readonly title: string;
  readonly introduction: string;
  readonly appTitle: string;
  readonly appDescription: string;
  readonly tools: readonly string[];
  readonly workflowTitle: string;
  readonly workflow: Readonly<Record<GuideWorkflowId, GuideWorkflowCopy>>;
  readonly sections: Readonly<Record<GuideSectionId, GuideSectionCopy>>;
  readonly footer: string;
}

export interface GuideLanguageOption {
  readonly id: GuideLocale;
  readonly label: string;
}

export const GUIDE_LANGUAGE_OPTIONS: readonly GuideLanguageOption[] = [
  { id: "ko", label: "한국어" },
  { id: "en", label: "English" },
  { id: "zh", label: "简体中文" },
  { id: "zh_tw", label: "繁體中文" },
  { id: "ja", label: "日本語" },
];

export const DEFAULT_GUIDE_LOCALE: GuideLocale = "en";

export const isGuideLocale = (value: string | null): value is GuideLocale =>
  typeof value === "string" && /^[a-z][a-z0-9_]{0,31}$/.test(value);

export const isBundledGuideLocale = (
  locale: GuideLocale,
): locale is BundledGuideLocale =>
  locale === "ko" || locale === "en" || locale === "zh" || locale === "ja";

export const GUIDE_LOCALES = {
  ko: {
    languageSelectorLabel: "가이드 언어 선택",
    title: "TFT 팀 조합 추천 도구 사용법",
    introduction:
      "후보 유닛 중에서 팀을 고르되, 고정 유닛은 반드시 포함하고 추가 상징까지 계산해 특성이 잘 활성화되는 조합을 찾는 도구입니다. 아래 탭을 순서대로 설정하면 됩니다.",
    appTitle: "휴대폰에서도 팀 보기",
    appDescription: "언제든 추천 팀을 확인하고 비교해요",
    tools: ["후보 범위 정하기", "필수 유닛·상징 반영", "추천 조합 비교"],
    workflowTitle: "정확한 추천을 받는 네 단계",
    workflow: {
      choose: {
        title: "후보 유닛 선택",
        detail: "알고리즘이 빈자리에 넣어 볼 챔피언을 고릅니다.",
      },
      required: {
        title: "고정 유닛·상징 설정",
        detail: "반드시 넣을 챔피언과 이미 보유한 추가 상징 수를 정합니다.",
      },
      recommend: {
        title: "조합 추천 실행",
        detail: "사용할 작업 탭을 고른 뒤 최종 인원 수를 입력하고 최적 팀 구성을 누릅니다.",
      },
      save: {
        title: "결과 비교·적용",
        detail: "점수와 활성 특성을 비교하고 원하는 조합을 고정 유닛으로 적용합니다.",
      },
    },
    sections: {
      navigation: {
        title: "다섯 개 탭의 역할",
        label: "탭 안내",
        description: "각 탭은 추천에 들어갈 조건 하나를 담당합니다.",
        points: [
          "가이드: 지금 보고 있는 사용법 화면입니다.",
          "조합 추천: 서로 독립된 작업 탭에서 조건을 정하고 계산한 뒤 여러 추천 결과를 비교합니다.",
          "후보 유닛: 알고리즘이 고정 유닛 외의 빈자리에 넣을 수 있는 챔피언 목록을 정합니다.",
          "고정 유닛: 모든 추천 조합에 반드시 들어가야 하는 챔피언을 정합니다.",
          "추가 상징: 챔피언이 아닌 상징·증강·보너스로 늘어난 특성 수를 입력합니다.",
          "탭 버튼을 누르거나 화면을 옆으로 넘겨 이동할 수 있습니다. 위아래 스크롤은 현재 탭의 내용을 봅니다.",
          "언어 선택은 가이드와 나머지 앱 화면을 함께 바꾸며, 직접 고른 언어는 다음 실행에도 유지됩니다.",
        ],
      },
      teamBuilder: {
        title: "조합 추천 탭",
        label: "계산·결과",
        description: "후보 유닛에서 빈자리를 채우고, 고정 유닛과 추가 상징을 함께 계산해 점수가 높은 조합을 보여줍니다.",
        points: [
          "상단의 +는 빈 작업 탭을 만들고, 선택 복사는 현재 탭의 후보·고정·추가 상징·인원 수·섞기 설정을 새 탭에 복사합니다. 탭마다 계산 결과까지 따로 기억하며, ×로 필요 없는 탭을 닫습니다.",
          "인원 수는 완성할 팀의 총 챔피언 수입니다. 고정 유닛 수보다 작게 입력할 수 없습니다.",
          "최적 팀 구성은 활성 특성 단계, 챔피언 비용, OP 가산점과 전사·탱커·원거리·암살자 역할 가산점 등 서버의 현재 계산 설정을 반영합니다. 운영자가 설정을 바꾸면 웹과 앱을 다시 설치하지 않아도 다음 실행부터 적용됩니다.",
          "후보 순서 섞기를 켠 경우에만 후보 순서를 무작위로 바꿔 비슷한 점수의 다른 조합을 탐색합니다. 결과의 고정 유닛으로 적용을 누르면 그 팀이 현재 작업 탭의 고정 유닛이 됩니다.",
          "선택 전체 초기화는 현재 작업 탭의 후보 유닛·고정 유닛·추가 상징을 한 번에 해제하며, 다른 작업 탭의 선택에는 영향을 주지 않습니다.",
        ],
      },
      candidates: {
        title: "후보 유닛 탭",
        label: "선택 가능 범위",
        description: "여기서 선택한 챔피언만 알고리즘이 고정 유닛 외의 빈자리에 넣어 볼 수 있습니다. 선택하지 않은 챔피언은 자동 추천에 나오지 않습니다.",
        points: [
          "챔피언 이름, 이름의 첫소리, 특성 이름으로 찾을 수 있습니다. 1~5코스트 버튼은 같은 가격 챔피언을 한 번에 선택하거나 해제합니다.",
          "전사·탱커·원거리·암살자 버튼은 물리/마법 세부 역할을 네 그룹으로 묶어 해당 역할의 후보를 한 번에 선택하거나 해제합니다.",
          "카드 왼쪽 위 정보 버튼을 누르면 특성과 별 단계 전투 수치를 볼 수 있어요. OP 배지를 누르면 비교 정보도 볼 수 있어요.",
          "검색창 위의 선택 목록이나 선택된 카드를 다시 누르면 후보에서 빠집니다.",
          "이름 뒤에 (특성)이 붙은 카드는 같은 챔피언의 특성 선택형입니다. 서로 다른 변형도 같은 기본 챔피언으로 처리하므로 후보와 고정에 동시에 넣을 수 없고, 한쪽에서 고르면 다른 쪽에서 자동으로 빠집니다.",
        ],
      },
      fixed: {
        title: "고정 유닛 탭",
        label: "반드시 포함",
        description: "이미 보유했거나 반드시 사용하려는 챔피언을 정합니다. 고정 유닛은 계산되는 모든 추천 조합에 먼저 포함됩니다.",
        points: [
          "검색과 선택 해제 방법은 후보 유닛 탭과 같습니다.",
          "고정 유닛 수만큼 팀 자리가 먼저 채워지므로, 필요한 핵심 유닛만 고정하는 편이 탐색 범위를 넓게 유지합니다.",
          "추천 결과에서는 고정 표시로 필수 챔피언과 새로 추천된 챔피언을 구분합니다.",
        ],
      },
      traits: {
        title: "추가 상징 탭",
        label: "추가 특성 수",
        description: "상징, 증강 또는 특별 보너스로 얻었지만 챔피언 목록에는 없는 추가 특성 수를 입력합니다.",
        points: [
          "특성 이름이나 첫소리로 찾은 뒤 -와 + 버튼으로 실제 보유 수만큼 조절합니다.",
          "입력한 수는 각 조합의 챔피언이 제공하는 특성 수에 더해져 활성 단계와 추천 점수에 반영됩니다.",
          "수량을 0으로 만들면 선택에서 빠지고, 초기화 버튼은 입력한 추가 상징만 모두 지웁니다.",
        ],
      },
    },
    footer:
      "추천 결과가 없거나 원하는 방향과 다르면 후보 유닛을 넓히고, 고정 유닛과 추가 상징 수가 실제 보유 상태와 맞는지 확인해 보세요.",
  },
  en: {
    languageSelectorLabel: "Choose guide language",
    title: "How to use the TFT Team Builder",
    introduction:
      "The builder fills a team from your chosen Champions, always includes every Must-use unit, and counts Extra Emblems when it searches for strong trait combinations. Set the tabs below in order.",
    appTitle: "View teams on your phone",
    appDescription: "Check and compare suggested teams anytime",
    tools: ["Define the candidate list", "Include required units and emblems", "Compare team results"],
    workflowTitle: "Four steps to an accurate result",
    workflow: {
      choose: { title: "Choose Champions", detail: "Select the champions the algorithm may use for open team slots." },
      required: { title: "Set Must-use and Emblems", detail: "Choose required champions and enter extra trait counts you already have." },
      recommend: { title: "Run Team Builder", detail: "Choose a work tab, enter the final team size, and select Build best team." },
      save: { title: "Compare and apply", detail: "Compare scores and active traits, then apply a result as Must-use units." },
    },
    sections: {
      navigation: {
        title: "What each tab does",
        label: "TAB GUIDE",
        description: "Each tab controls one part of the recommendation input or result.",
        points: [
          "Guide: the instructions you are reading now.",
          "Team Builder: keep separate sets of inputs in work tabs, run calculations, and compare suggested teams.",
          "Champions: define which champions may fill slots that are not already fixed.",
          "Must-use: define champions that must appear in every suggested team.",
          "Emblems: enter trait counts gained from emblems, augments, or other bonuses rather than champions.",
          "Use the tab buttons or a sideways swipe to move between tabs. Vertical scrolling stays inside the current tab.",
          "The language selector changes both the guide and the rest of the app, and remembers a language you choose manually for the next launch.",
        ],
      },
      teamBuilder: {
        title: "Team Builder tab",
        label: "CALCULATE AND COMPARE",
        description: "The builder fills open slots from Champions, keeps all Must-use units, adds Extra Emblems, and returns the highest-scoring combinations.",
        points: [
          "Use + at the top for an empty work tab. Copy choices creates a new tab with the current Champions, Must-use units, Emblems, team size, and shuffle setting. Each tab keeps its own results, and × closes an unused tab.",
          "Team size is the total number of champions in the finished team. It cannot be smaller than the Must-use count.",
          "Build best team uses active trait tiers, champion cost, the OP bonus, and Fighter, Tank, Ranged, and Assassin role bonuses from the server's current calculation settings. Administrator changes apply on the next run without reinstalling the web or mobile app.",
          "Only turning on shuffle randomizes candidate order to explore other similarly scored teams. Use as must-use makes that result the Must-use list for the current work tab.",
          "Clear all choices removes Champions, Must-use units, and Extra Emblems from the current work tab only; choices in other work tabs stay unchanged.",
        ],
      },
      candidates: {
        title: "Champions tab",
        label: "ALLOWED CHOICES",
        description: "Only champions selected here may fill non-fixed slots. An unselected champion will not appear automatically in a suggestion.",
        points: [
          "Search by champion name or trait. The 1-5 cost buttons select or clear every champion at that cost.",
          "The Fighter, Tank, Ranged, and Assassin buttons group physical and magic subroles and select or clear all matching candidates at once.",
          "Select the info button at the top-left of a card to see its traits and star-level stats. Select an OP badge to see comparison information.",
          "Select a chosen card or its chip above the search box again to remove it from the candidate list.",
          "A card with a trait in parentheses is a trait-choice version of the same champion. Different versions still share one base champion, so they cannot be in Champions and Must-use at the same time; choosing one side removes the other.",
        ],
      },
      fixed: {
        title: "Must-use tab",
        label: "ALWAYS INCLUDED",
        description: "Choose champions you already own or must play. Every suggested team starts with all Must-use champions included.",
        points: [
          "Searching and removing choices works the same way as the Champions tab.",
          "Must-use units occupy team slots first, so fixing only the necessary core units leaves the search more room to work.",
          "Result cards mark Must-use units separately from champions added by the recommendation.",
        ],
      },
      traits: {
        title: "Emblems tab",
        label: "EXTRA TRAIT COUNTS",
        description: "Enter trait counts supplied by emblems, augments, or special bonuses that are not already provided by champions.",
        points: [
          "Search for a trait, then use - and + until the number matches what you actually have.",
          "The entered count is added to the champions' trait count when active tiers and recommendation scores are calculated.",
          "A count of 0 removes the trait from your choices. Reset clears only the extra emblem inputs.",
        ],
      },
    },
    footer: "If no useful result appears, broaden Champions and check that Must-use units and Extra Emblem counts match what you actually have.",
  },
  zh: {
    languageSelectorLabel: "选择指南语言",
    title: "TFT 阵容推荐工具使用指南",
    introduction: "工具会从候选英雄中补齐阵容，保证所有必选英雄都在队内，并把额外纹章计入特性数量，再搜索特性搭配较好的阵容。请按顺序设置下面的标签页。",
    appTitle: "在手机上查看阵容",
    appDescription: "随时查看和比较推荐阵容",
    tools: ["确定候选范围", "加入必选英雄与纹章", "比较推荐阵容"],
    workflowTitle: "获得准确推荐的四个步骤",
    workflow: {
      choose: { title: "选择候选英雄", detail: "选择算法可以用来填补空位的英雄。" },
      required: { title: "设置必选英雄与纹章", detail: "选择必须上场的英雄，并填写已有的额外特性数量。" },
      recommend: { title: "运行阵容推荐", detail: "先选择工作标签，再输入最终队伍人数并生成最佳阵容。" },
      save: { title: "比较并应用", detail: "比较分数和激活特性，再把满意的阵容设为必选。" },
    },
    sections: {
      navigation: {
        title: "五个标签页的作用",
        label: "标签说明",
        description: "每个标签页负责一项推荐条件或结果。",
        points: [
          "指南：当前正在阅读的使用说明。",
          "阵容推荐：在互相独立的工作标签中保存不同条件，运行计算并比较推荐结果。",
          "候选英雄：规定算法可以用哪些英雄填补未固定的位置。",
          "必选英雄：规定每个推荐阵容中都必须出现的英雄。",
          "额外纹章：填写由纹章、强化符文或其他奖励提供，而不是由英雄提供的额外特性数量。",
          "点击标签按钮或横向滑动可以切换页面；上下滚动只浏览当前标签的内容。",
          "语言选择会同时切换指南和应用的其他界面，并在下次启动时保留手动选择的语言。",
        ],
      },
      teamBuilder: {
        title: "阵容推荐标签",
        label: "计算与结果",
        description: "工具从候选英雄中填补空位，保留所有必选英雄，加上额外纹章后显示分数最高的阵容。",
        points: [
          "点击上方的 + 可新建空白工作标签；复制选择会把当前标签的候选、必选、额外纹章、队伍人数和随机设置复制到新标签。每个标签分别保存计算结果，可用 × 关闭不用的标签。",
          "队伍人数是最终阵容的英雄总数，不能少于必选英雄数量。",
          "生成最佳阵容会使用激活特性阶段、英雄费用、OP 加分，以及战士、坦克、远程和刺客定位加分等服务器当前计算设置。管理员修改设置后，无需重新安装网页或应用，下一次运行就会应用。",
          "只有开启候选顺序随机时才会打乱候选，以探索分数接近的其他阵容。设为必选会把该结果设为当前工作标签的必选英雄。",
          "重置全部选择只会清除当前工作标签的候选英雄、必选英雄和额外纹章，不影响其他工作标签。",
        ],
      },
      candidates: {
        title: "候选英雄标签",
        label: "可选范围",
        description: "只有在这里选中的英雄才能填补非固定位置。未选中的英雄不会自动出现在推荐阵容中。",
        points: [
          "可以按英雄名称或特性查找。1-5费按钮可一次选择或清除同费用的全部英雄。",
          "战士、坦克、远程和刺客按钮会把物理/魔法细分定位归为四组，可一次选择或清除符合定位的全部候选英雄。",
          "点击卡片左上角的信息按钮可以查看特性和各星级数值。点击 OP 标记可以查看比较信息。",
          "再次点击已选卡片或搜索框上方的标签，即可从候选范围中移除。",
          "名字后带（特性）的卡片是同一英雄的特性选择版本。不同版本仍属于同一个基础英雄，不能同时出现在候选和必选中；在一侧选择后会自动从另一侧移除。",
        ],
      },
      fixed: {
        title: "必选英雄标签",
        label: "必须加入",
        description: "选择已经拥有或一定要使用的英雄。所有推荐阵容都会先包含全部必选英雄。",
        points: [
          "查找和取消选择的方法与候选英雄标签相同。",
          "必选英雄会先占用队伍位置，因此只固定必要的核心英雄能给算法留下更多搜索空间。",
          "推荐结果会分别标记必选英雄和算法新加入的英雄。",
        ],
      },
      traits: {
        title: "额外纹章标签",
        label: "额外特性数量",
        description: "填写由纹章、强化符文或特殊奖励提供，但英雄本身没有提供的额外特性数量。",
        points: [
          "查找特性后，用 - 和 + 调整到实际拥有的数量。",
          "输入数量会加到阵容英雄提供的特性数量上，并用于计算激活阶段和推荐分数。",
          "数量调为 0 后会移出选择；重置只会清除额外纹章输入。",
        ],
      },
    },
    footer: "如果没有结果或结果不符合预期，请扩大候选英雄范围，并确认必选英雄与额外纹章数量是否和实际持有情况一致。",
  },
  ja: {
    languageSelectorLabel: "ガイドの言語を選ぶ",
    title: "TFT チーム提案ツールの使い方",
    introduction: "候補から空き枠を選び、必須チャンピオンを必ず含め、追加紋章も特性数に加えて、特性がよく発動するチームを探すツールです。下のタブを順番に設定してください。",
    appTitle: "スマホでもチームを見る",
    appDescription: "いつでもおすすめチームを確認して比べられます",
    tools: ["候補範囲を決める", "必須と紋章を反映する", "提案チームを比べる"],
    workflowTitle: "正確な提案を得る四つの手順",
    workflow: {
      choose: { title: "候補を選ぶ", detail: "アルゴリズムが空き枠に入れてよいチャンピオンを選びます。" },
      required: { title: "必須・紋章を設定", detail: "必ず入れるチャンピオンと、所持している追加特性数を設定します。" },
      recommend: { title: "チーム提案を実行", detail: "作業タブを選び、完成時の人数を入力して最適チームを作ります。" },
      save: { title: "比較して適用", detail: "スコアと発動特性を比べ、選んだ結果を必須に適用します。" },
    },
    sections: {
      navigation: {
        title: "五つのタブの役割",
        label: "タブ案内",
        description: "各タブが提案条件または結果の一部を担当します。",
        points: [
          "ガイド：今読んでいる使い方の画面です。",
          "チーム提案：独立した作業タブごとに条件を保存し、計算して提案結果を比較します。",
          "候補：必須以外の空き枠に使ってよいチャンピオンを決めます。",
          "必須：すべての提案チームに必ず入れるチャンピオンを決めます。",
          "追加紋章：チャンピオンではなく、紋章・オーグメント・ボーナスから得た追加特性数を入力します。",
          "タブボタンまたは横スワイプで移動できます。上下スクロールは現在のタブの内容を表示します。",
          "言語選択はガイドとアプリ全体を同時に切り替え、手動で選んだ言語は次回起動時も維持されます。",
        ],
      },
      teamBuilder: {
        title: "チーム提案タブ",
        label: "計算・結果",
        description: "候補から空き枠を埋め、必須を残し、追加紋章も加えて、スコアの高い組み合わせを表示します。",
        points: [
          "上部の + は空の作業タブを作ります。選択をコピーは現在の候補・必須・追加紋章・人数・シャッフル設定を新しいタブへ複製します。結果もタブごとに保存され、不要なタブは × で閉じます。",
          "チーム人数は完成チームの合計人数です。必須チャンピオン数より少なくできません。",
          "最適チームは発動特性の段階、チャンピオンのコスト、OP ボーナス、ファイター・タンク・遠隔・アサシンの役割ボーナスなど、サーバーの現在の計算設定を使います。管理者の変更は Web やアプリを再インストールせず次の実行から反映されます。",
          "候補シャッフルを有効にした場合だけ順序をランダム化し、同程度の別チームを探索します。必須にするを押すと、その結果が現在の作業タブの必須になります。",
          "選択をすべてリセットは現在の作業タブの候補・必須・追加紋章だけを解除し、他の作業タブには影響しません。",
        ],
      },
      candidates: {
        title: "候補タブ",
        label: "選択可能な範囲",
        description: "ここで選んだチャンピオンだけが、必須以外の空き枠に入れられます。選ばなかったチャンピオンは自動提案に出ません。",
        points: [
          "チャンピオン名や特性で検索できます。1〜5コストのボタンで同コストをまとめて選択・解除できます。",
          "ファイター・タンク・遠隔・アサシンのボタンは物理/魔法の細分類を四つにまとめ、該当する候補を一括で選択・解除します。",
          "カード左上の情報ボタンを押すと、特性と星ごとの数値を見られます。OP バッジを押すと比較情報を見られます。",
          "選択済みカード、または検索欄の上にある項目をもう一度押すと候補から外れます。",
          "名前の後ろに（特性）が付くカードは、同じチャンピオンの特性選択版です。別の版でも基本チャンピオンは同じなので候補と必須の両方には置けず、片方で選ぶともう片方から外れます。",
        ],
      },
      fixed: {
        title: "必須タブ",
        label: "必ず含める",
        description: "すでに所持している、または必ず使うチャンピオンを選びます。すべての提案チームは必須を先に含めます。",
        points: [
          "検索と選択解除の方法は候補タブと同じです。",
          "必須は先にチーム枠を使うため、本当に必要な中核だけを固定すると探索の自由度を広く保てます。",
          "提案結果では、必須とアルゴリズムが新しく追加したチャンピオンを分けて表示します。",
        ],
      },
      traits: {
        title: "追加紋章タブ",
        label: "追加特性数",
        description: "紋章、オーグメント、特別ボーナスから得た、チャンピオン自身が持たない追加特性数を入力します。",
        points: [
          "特性を検索し、- と + で実際の所持数に合わせます。",
          "入力数はチャンピオンが持つ特性数に加算され、発動段階と提案スコアの計算に使われます。",
          "0 にすると選択から外れます。リセットは追加紋章の入力だけをすべて消します。",
        ],
      },
    },
    footer: "結果がない、または期待と違う場合は候補を広げ、必須と追加紋章の数が実際の所持状況と合っているか確認してください。",
  },
} as const satisfies Record<BundledGuideLocale, GuideCopy>;
