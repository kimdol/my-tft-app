# TFT 팀 조합 추천기 — 프런트엔드 아키텍처와 문제 해결 기록

1인 개발 프로젝트 · 2026.01.05 ~ 진행 중

사용자가 선택한 후보 유닛, 반드시 포함할 고정 유닛, 추가 상징 수량을 바탕으로 특성 breakpoint가 높은 팀을 추천하는 React 애플리케이션입니다. WordPress 플러그인으로 웹에 배포하면서 같은 빌드 결과를 Capacitor Android 앱에서도 사용합니다.

처음에는 챔피언을 고르고 계산 버튼을 누르면 끝나는 화면이라고 생각했습니다. 후보가 적고 화면이 하나일 때는 실제로 그렇게 동작했습니다. 하지만 후보 수를 늘리자 계산 시간이 눈에 띄게 길어졌고, 탭을 오가며 선택을 바꾸면 서로 다른 화면의 상태가 어긋나기 시작했습니다. 개발 서버에서 멀쩡하던 버튼과 스크롤은 WordPress에 올리자 달라졌고, 같은 React 빌드를 사용하는 Android 앱이 서버와 다른 시즌 데이터를 보여 주는 경우도 생겼습니다.

그때부터 기능을 더 붙이는 것보다, 문제가 생긴 경계를 하나씩 다시 정하는 데 더 많은 시간을 썼습니다. 아래에는 완성된 구조만 기능별로 나열하지 않고, 처음 어떤 방식으로 만들었는지, 실제 사용 중 무엇이 어긋났는지, 확인한 원인을 바탕으로 어떤 선택을 다시 했는지를 다섯 가지 사례로 정리했습니다.

## 전체 구조

```mermaid
flowchart TB
    Source["CommunityDragon 원본 데이터"] --> Sync["WordPress 동기화 · 정규화 · OP 계산 · 이미지 저장"]
    AdminSettings["WordPress 관리자 계산 설정"] --> Sync
    Sync --> Dataset["Dataset REST snapshot"]
    Sync --> Translations["언어별 Translation REST catalog"]

    subgraph Client["동일한 React 클라이언트 · WordPress Web / Capacitor Android"]
        Config["런타임 주소 · 빔 설정 해석"]
        Boundary["스키마 · 개수 · 이미지 경로 검증"]
        DataStore["TFTBuilderStore"]
        I18n["AppI18nProvider"]
        Workspace["탭 · 선택기 · 반응형 워크스페이스"]
        Actions["사용자 Action"]
        RecommendationStore["RecommendationStore"]
        Beam["Beam Search · 특성 점수 계산"]
        Result["추천 결과 · 통합 상세 Popover"]

        Config --> Boundary
        Boundary --> DataStore
        I18n --> Workspace
        DataStore --> Workspace
        Workspace --> Actions
        Actions --> DataStore
        Actions --> RecommendationStore
        DataStore --> Beam
        RecommendationStore --> Beam
        Beam --> RecommendationStore
        RecommendationStore --> Result
        Result --> Actions
    end

    Dataset --> Config
    AdminSettings --> Config
    Translations --> I18n
```

| 영역 | 책임 | 대표 코드 |
|---|---|---|
| API 경계 | 런타임 주소 해석, 응답 검증, 요청 병합, 마지막 정상 snapshot 보존 | [`api/tftApi.ts`](./api/tftApi.ts) |
| 계산 코어 | 조합 상태 정규화, Beam Search, breakpoint 점수와 활성 특성 계산 | [`core`](./core) |
| Flux 스타일 상태 | 서버 데이터, 하위 탭별 사용자 선택, 화면 모드, 추천 snapshot과 action 관리 | [`store`](./store), [`team-builder/recommendationStore.ts`](./team-builder/recommendationStore.ts) |
| 국제화 | 기기 언어, 수동 선택, 번들 fallback, WordPress 실시간 번역 결합 | [`i18n`](./i18n) |
| 웹 UI | 선택 전략, 점진 렌더링, 탭·캐러셀, Portal 상세 정보, WordPress CSS 격리 | [`selector`](./selector), [`workspace`](./workspace), [`details`](./details) |

## 기술 스택

- React 19, TypeScript, Vite
- Zustand
- Tailwind CSS
- WordPress REST API
- Capacitor Android

## 포트폴리오로 고른 다섯 가지 문제 해결

각 사례는 성공한 최종 구조부터 설명하기보다 `처음 선택한 방식 → 실제로 마주친 증상 → 원인을 확인한 과정 → 바꾼 구조 → 결과와 남은 선택`이 자연스럽게 이어지도록 정리했습니다.

### 1. 전수조사 대신 Beam Search로 탐색량을 통제했다

처음에는 고정 유닛을 먼저 넣고 후보 `c`명 중 남은 `d`명을 전부 조합한 뒤, 가장 높은 점수의 팀을 고르면 된다고 생각했습니다. 후보가 적을 때는 결과도 정확했고 속도도 문제없었습니다. 그런데 후보를 하나씩 늘려 직접 계산해 보니 어느 순간부터 버튼을 누른 뒤 기다리는 시간이 빠르게 길어졌습니다. 후보 50명 중 8명을 고르는 경우를 계산해 보니 가능한 조합만 536,878,650개였습니다. 팀 점수를 더 빠르게 계산하기 전에, 그 계산 자체를 몇 번 반복할 것인지부터 줄여야 했습니다.

정확한 답을 포기하지 않고 탐색량을 줄일 방법을 찾다가 다익스트라도 검토했습니다. 챔피언을 하나씩 선택하는 과정을 경로로 보면 재사용할 수 있을 것 같았습니다. 하지만 실제 특성 점수를 넣어 보니 같은 챔피언이라도 현재 팀이 어떤 breakpoint 직전에 있는지에 따라 추가 점수가 달라졌습니다. 고정된 간선 비용을 만들 수 없었고, 팀 부분집합을 정점으로 표현하면 전수조사와 비슷한 수의 상태가 다시 생겼습니다. 문제를 그래프로 옮겼을 뿐 탐색량은 그대로였습니다.

결국 모든 조합을 끝까지 남기는 대신, 각 깊이에서 가능성이 높은 경로만 유지하는 Beam Search를 선택했습니다. 한 명을 추가할 때마다 점수 상위 `b`개만 다음 단계로 넘기자 계산량은 통제됐지만, 실행 결과를 살펴보니 같은 팀이 선택 순서만 달리해 여러 번 평가되고 있었습니다. 정렬된 챔피언 ID로 조합 key를 만들고, 같은 `baseId`의 변형 유닛과 이미 방문한 조합을 확장 전에 제거해 이 중복을 막았습니다. 후보 순서는 사용자가 랜덤 옵션을 켠 경우에만 seed 기반 Fisher–Yates로 섞었습니다.

현재 기본 빔 너비 28과 결과 5개는 WordPress 관리자에서 조정하며, 웹과 앱은 실행할 때 이 값을 받아 계산합니다. 팀 하나의 생성·평가 비용을 `P`라고 하면 시간 복잡도는 전수조사의 `O(C(c,d) × P)`에서 `O(d × b × c × (P + log(b × c)))`로 제한됩니다. 전역 최적해를 항상 보장하지 않는다는 선택은 남았지만, 실제 사용자가 기다릴 수 있는 시간과 결과 품질 사이의 균형을 재배포 없이 운영값으로 조절할 수 있게 됐습니다.

```mermaid
flowchart TD
    Goal["목표 · 제한 시간 안에 최고 점수 팀 추천"] --> Exhaustive["1차 선택 · nCr 전수조사"]
    Exhaustive --> CombinationProblem["문제 · C(c,d) 조합 폭증"]
    CombinationProblem --> Dijkstra["2차 검토 · 다익스트라로 경로화"]
    Dijkstra --> GraphProblem["문제 · 점수가 부분집합 전체에 의존<br/>고정 간선 비용과 비음수 최단 경로 조건 불충족"]
    GraphProblem --> Beam["해결 · 깊이마다 상위 b개만 유지"]
    Beam --> Normalize["정렬 key · baseId · visited로 중복 제거"]
    Normalize --> Evaluate["breakpoint · OP · 코스트 원시 점수 평가"]
    Evaluate --> Limit["beam width 28 · 결과 최대 5개"]
    Limit --> Complexity["O(C(c,d) × P)<br/>→ O(d × b × c × (P + log(b × c)))"]
```

관련 코드: [`core/beamSearchOptimizer.ts`](./core/beamSearchOptimizer.ts), [`core/Node.ts`](./core/Node.ts), [`core/traitEvaluator.ts`](./core/traitEvaluator.ts), [`core/candidateOrder.ts`](./core/candidateOrder.ts)

### 2. Flux 스타일 단방향 흐름으로 상태의 의미를 지켰다

후보 화면과 고정 유닛 화면을 처음 만들 때는 각 컴포넌트가 필요한 local state를 따로 가지게 했습니다. 화면 하나만 볼 때는 가장 단순한 구조였습니다. 하지만 후보에서 고른 유닛을 고정 유닛으로 다시 선택해 보니 같은 `baseId`의 변형이 두 Set에 동시에 남았습니다. 한쪽에서 선택하면 다른 쪽에서 지우는 분기를 컴포넌트마다 붙였고, 이번에는 탭이 언마운트될 때 계산해 둔 추천 결과가 함께 사라졌습니다.

추천 결과를 전역 store로 옮기자 결과는 유지됐지만 반대 문제가 나타났습니다. 후보나 추가 상징을 바꾼 뒤에도 이전 결과가 그대로 보여서, 방금 선택한 조건으로 계산된 것처럼 보였습니다. 상태를 따라가며 확인해 보니 결과 배열만 보관했을 뿐, 그 결과를 만든 입력은 남기지 않고 있었습니다. 어느 화면에서 상태를 바꾸느냐보다, 하나의 변경 규칙과 결과의 유효 기간을 어디에서 책임질지가 핵심이었습니다.

그래서 View는 action만 전달하고 Zustand store가 다음 상태를 만드는 단방향 흐름으로 바꿨습니다. `toggle`, `toggleFixed`, `applyTeamAsFixed`가 동일 `baseId`를 반대 Set에서도 함께 제거하도록 해 선택 규칙을 한곳에 모았습니다. 추천을 실행할 때는 후보·고정·상징·인원·랜덤 여부·서버 OP 버전·빔 설정을 signature로 남깁니다. 현재 입력과 이 signature가 달라지는 순간 기존 결과를 숨기고 재계산이 필요하다고 표시하도록 결과의 수명도 함께 정의했습니다.

Chrome처럼 여러 추천 작업을 열 수 있는 하위 탭을 추가했을 때는 이 경계를 다시 점검하게 됐습니다. 처음에는 결과 배열만 탭별로 나눴는데, 탭을 바꾸자 후보·고정·상징 값은 여전히 다른 탭의 값으로 덮어써졌습니다. 결과만이 아니라 그 결과를 만드는 입력 전체가 하나의 작업이라는 뜻이었습니다. 각 탭이 선택 Set, 추가 상징 Map, 팀 인원, 랜덤 여부, 계산 snapshot을 하나의 세션으로 보관하게 하고, 실제 챔피언·특성 데이터만 세션 사이에서 공유하도록 범위를 넓혔습니다.

이제 첫 탭을 포함해 기본 3개의 작업을 따로 열어 비교할 수 있고, 탭 상한은 관리자 설정으로 바뀝니다. 선택 조회는 `Set.has` 기준 평균 `O(1)`, 불변 Set·Map 갱신은 선택 수 `k`에 대해 `O(k)`입니다. 탭을 오가도 각 작업은 그대로 복원되며, 그 결과를 만든 입력이나 운영 설정이 실제로 달라졌을 때만 해당 결과가 무효화됩니다.

```mermaid
flowchart TB
    User["사용자 입력"] --> View["React View"]
    View -->|Action 전달| Action["Zustand Store Action"]
    Action --> BuilderAction["후보 · 고정 · 상징 상태 전이"]
    Action --> RecommendationAction["추천 실행 · 완료 · 실패 상태 전이"]
    BuilderAction --> Invariant["동일 baseId를 반대 Set에서 제거<br/>새 데이터에 없는 ID 정리"]
    Invariant --> BuilderStore["TFTBuilderStore의 다음 상태"]
    BuilderStore --> Signature["현재 계산 입력으로 signature 생성"]
    RecommendationAction --> Snapshot["결과 + 계산 당시 signature + 생성 시각"]
    Signature --> Compare{"현재 signature와 같은가?"}
    Snapshot --> Compare
    Compare -->|같음| Current["현재 추천 결과 노출"]
    Compare -->|다름| Stale["결과 숨김 · 재계산 필요"]
    Current --> Selector["selector · hook으로 파생 상태 계산"]
    Stale --> Selector
    Selector --> Render["View 재렌더링"]
```

관련 코드: [`store/useTFTBuilderStore.ts`](./store/useTFTBuilderStore.ts), [`team-builder/recommendationStore.ts`](./team-builder/recommendationStore.ts), [`team-builder/recommendationSignature.ts`](./team-builder/recommendationSignature.ts), [`selector/champion-selector/selectorStrategies.ts`](./selector/champion-selector/selectorStrategies.ts)

### 3. WordPress REST 응답을 신뢰 경계에서 검증했다

웹과 Android 앱이 같은 React 코드를 사용하게 만든 초기에, REST가 HTTP 200만 반환하면 응답을 TypeScript 타입으로 단언해 바로 store에 넣었습니다. 정상 데이터만 오갈 때는 이 방식의 문제가 드러나지 않았습니다. 시즌 교체 상황을 확인하려고 일부 필드를 빼 보자 이전 schema와 metadata 개수 불일치가 그대로 통과했고, 외부 이미지 주소도 아무 검증 없이 렌더링됐습니다. 여러 화면을 한꺼번에 열면 같은 dataset 요청까지 중복으로 발생했습니다.

가장 분명한 증상은 네트워크를 잠시 끊었다가 다시 연결했을 때 나타났습니다. 새 요청 한 번이 실패했다는 이유로 이미 정상적으로 보고 있던 데이터까지 화면에서 사라졌습니다. 이 흐름을 추적하면서 TypeScript 타입은 컴파일 시점의 약속일 뿐, 서버에서 들어오는 JSON을 실제로 검사해 주지 않는다는 점을 코드 경계에서 놓쳤다는 것을 확인했습니다. URL 해석, payload 검증, 중복 요청, 실패 복구가 각각의 호출부에 흩어져 있어 어느 시점부터 데이터를 믿어도 되는지도 분명하지 않았습니다.

이후 API 모듈을 외부 데이터가 들어오는 신뢰 경계로 정했습니다. 응답은 먼저 `unknown`으로 받고 champion, trait, OP, metadata 구조와 schema version, 실제 배열 개수, 로컬 asset base까지 모두 확인한 뒤에만 도메인 모델로 바꿉니다. 동시에 들어온 호출은 하나의 in-flight Promise를 공유하게 했고, 새 요청이 실패하면 세션에 남아 있는 마지막 정상 snapshot을 유지합니다. focus·online·visibility가 돌아오는 시점에는 dataset과 관리자 계산 설정을 다시 확인하도록 복구 경로도 한곳에 묶었습니다.

OP 규칙은 WordPress가 snapshot을 만들 때 계산하고, 빔 너비·가중치·탭 상한은 별도 공개 설정 REST로 전달합니다. 관리자 값을 바꾼 뒤 웹과 앱을 다시 열어, 클라이언트를 재빌드하지 않아도 새 설정이 적용되는 것까지 확인했습니다. payload 요소 수를 `N`이라고 하면 검증은 시간 `O(N)`, 도메인 데이터와 조회 Map은 공간 `O(N)`이며, 여러 화면에서 동시에 요청해도 실제 진행 중인 네트워크 요청은 하나만 남습니다.

```mermaid
flowchart TD
    Goal["목표 · 웹과 앱에서 같은 최신 데이터 사용"] --> Simple["1차 구현 · HTTP 200 응답을 타입 단언"]
    Simple --> Failure["문제 · 잘못된 schema와 URL 통과<br/>중복 요청 · 일시 실패 시 화면 소실"]
    Failure --> Boundary["해결 · API 모듈을 신뢰 경계로 통합"]
    Boundary --> Resolve["환경별 runtime config 해석"]
    Resolve --> Shared["동시 호출은 in-flight Promise 공유"]
    Shared --> Validate["unknown → schema · 개수 · asset 경로 검증"]
    Validate -->|정상| Normalize["도메인 모델 · OP 조회 Map 생성"]
    Validate -->|실패| Fallback{"마지막 정상 snapshot이 있는가?"}
    Fallback -->|예| Keep["기존 화면 유지"]
    Fallback -->|아니오| Error["오류 상태 노출 · 다음 요청 재시도"]
    Normalize --> Store["store 갱신 · 무효 선택 제거"]
    Store --> Result["O(N) 검증 · 환경 공통 데이터 경로"]
```

관련 코드: [`api/tftApi.ts`](./api/tftApi.ts), [`workspace/hooks/useRuntimeDataRefresh.ts`](./workspace/hooks/useRuntimeDataRefresh.ts), [`store/useTFTBuilderStore.ts`](./store/useTFTBuilderStore.ts)

### 4. 고정 UI 번역과 시즌 데이터를 분리해 다국어를 운영했다

다국어를 처음 붙였을 때는 한국어, 영어, 일본어, 중국어 간체·번체의 UI 문구와 챔피언·특성 이름을 언어별 객체 하나에 모두 넣었습니다. 언어를 바꾸고 localStorage에서 복원하는 데까지는 잘 동작했습니다. 문제가 보인 것은 새 세트 데이터를 WordPress에 동기화한 뒤였습니다. 서버에는 새 챔피언이 들어왔지만 이미 설치된 앱은 번들에 남은 지난 시즌 이름을 보여 줬고, 번역 몇 줄을 고치기 위해 웹과 앱을 다시 빌드해야 했습니다.

어떤 문자열이 얼마나 자주 바뀌는지 다시 나눠 보니, 버튼처럼 거의 고정된 UI 문구와 시즌마다 교체되는 게임 데이터가 같은 배포 주기에 묶여 있었습니다. 언어를 결정하는 순서도 저장된 수동 선택, 기기 언어, 서버 번역, 오프라인 fallback이 한 흐름 안에서 섞여 있었습니다. 저장소 접근을 막은 상태로 실행해 보자 첫 화면의 언어가 일정하지 않았고, 우선순위가 코드에 명확히 드러나지 않는다는 점도 확인했습니다.

UI와 가이드는 앱 번들의 fallback으로 남기고, 시즌 챔피언명·특성명·특성 설명은 WordPress의 locale별 runtime catalog로 분리했습니다. 사용자가 직접 고른 언어가 있으면 가장 먼저 사용하고, 저장값이 없으면 `navigator.languages`를 해석합니다. 원격 catalog는 schema와 locale을 확인한 뒤 알려진 구조만 병합하며, prototype 오염에 쓰일 수 있는 key는 거부합니다. 같은 locale·endpoint 요청은 하나로 합치고 cache도 endpoint별로 나눴습니다.

이 구조를 적용한 뒤에는 특성 선택 유닛에서 한 번 더 표시 문제가 생겼습니다. 서버는 미스 포츈을 선택 특성에 따라 3개 ID로 나누지만 번역 catalog에는 기본 이름만 있어서, 언어를 바꾸면 카드 이름 뒤의 괄호가 사라졌습니다. 이름 문자열을 다시 잘라 붙이는 방식은 언어마다 깨질 가능성이 있어 사용하지 않았습니다. 대신 각 변형이 가진 실제 특성 API ID로 현재 언어의 특성명을 찾아 `미스 포츈 (복제자)`, `Miss Fortune (Replicator)`처럼 조합하도록 수정했습니다.

이제 고정 UI는 네트워크가 없어도 바로 표시되고, 시즌 문자열만 서버 동기화를 따라갑니다. catalog 문자열 수를 `K`라고 하면 검증·병합 시간과 cache 공간은 `O(K)`입니다. 저장소를 사용할 수 없는 환경에서는 현재 세션과 기기 언어를 사용하고, 앱을 삭제해 localStorage가 사라져도 기기 언어부터 다시 판단합니다.

```mermaid
flowchart TD
    Goal["목표 · 5개 언어와 시즌 번역을 함께 운영"] --> Simple["1차 구현 · 모든 번역을 앱 번들에 포함"]
    Simple --> Failure["문제 · 시즌마다 재빌드<br/>오래된 문자열 누적 · 서버와 앱 시점 불일치"]
    Failure --> Split["해결 · 안정 UI와 시즌 데이터를 분리"]
    Split --> Bundled["번들 · UI와 가이드 fallback"]
    Split --> Runtime["WordPress · locale별 시즌 catalog"]
    Split --> Manual["수동 선택 우선<br/>없으면 기기 언어 해석"]
    Runtime --> Validate["schema · locale · 안전한 key 검증"]
    Validate --> Cache["endpoint 단위 cache · 요청 병합"]
    Bundled --> Merge["알려진 구조만 병합"]
    Cache --> Merge
    Manual --> Merge
    Merge --> Result["즉시 UI + 최신 시즌 문자열<br/>시간·공간 O(K)"]
```

관련 코드: [`i18n/AppI18n.tsx`](./i18n/AppI18n.tsx), [`i18n/useAppI18n.ts`](./i18n/useAppI18n.ts), [`i18n/deviceLocale.ts`](./i18n/deviceLocale.ts), [`i18n/translationApi.ts`](./i18n/translationApi.ts), [`i18n/translationCatalog.ts`](./i18n/translationCatalog.ts)

### 5. WordPress 안에서도 모바일 앱처럼 안정적인 작업 화면을 만들었다

개발 서버에서 완성한 React 화면을 Elementor 페이지에 처음 넣었을 때는 같은 CSS가 그대로 적용될 것으로 예상했습니다. 실제 페이지를 열어 보니 Elementor의 전역 button 스타일이 앱 버튼을 덮어썼고, 모든 패널과 챔피언 카드를 처음부터 마운트한 모바일 화면은 첫 표시부터 늦었습니다. 세로로 목록을 넘기다 손가락이 조금만 대각선으로 움직여도 옆 탭으로 이동했고, 빠르게 한 번 스와이프하면 두 패널을 건너뛰는 경우도 있었습니다.

카드 안에 배치했던 상세 팝오버는 작은 화면에서 바로 잘렸습니다. 부모의 overflow를 벗어나지 못했고, 탭을 바꾸면 열림 상태와 focus도 함께 사라졌습니다. 각각 다른 증상처럼 보였지만 확인해 보니 WordPress 문서 안에서도 앱의 CSS와 좌표계가 독립적일 것이라고 가정한 점, 그리고 전체 데이터 수와 지금 DOM에 그려야 하는 수를 구분하지 않은 점에서 시작된 문제였습니다.

먼저 workspace root 아래에서 WordPress의 버튼 상태 스타일을 격리했습니다. 방문한 패널만 지연 마운트하고, 챔피언 목록은 viewport별 page size만 먼저 그린 뒤 IntersectionObserver가 보일 때 다음 묶음을 추가했습니다. 스와이프 임계값은 실제 모바일 화면에서 값을 바꿔 가며 확인했습니다. 가로 이동이 48px 이상이고 세로 이동의 1.4배를 넘을 때만 인접 패널 하나로 이동하게 하자 세로 스크롤과 가로 전환을 안정적으로 구분할 수 있었습니다. 상세 정보는 공용 store와 Portal로 옮겨 viewport 기준 위치, Escape, 외부 클릭, focus 복귀를 한곳에서 처리했습니다.

추천 하위 탭과 카드 배지를 추가한 뒤에는 390px viewport에서 탭 추가·전환·닫기와 배지 겹침을 다시 확인했습니다. 그 과정에서 정보·OP 버튼의 44px 터치 영역에 넣었던 반투명 blur가 선택 오버레이와 겹칠 때 물방울처럼 보이는 것도 발견했습니다. 터치 영역은 유지하되 바깥 blur와 그림자만 제거해 실제 아이콘이 또렷하게 보이도록 정리했습니다.

전체 목록이 `n`개여도 초기 카드 DOM은 page size `p`개만 만들어지므로 초기 렌더링은 `O(n)`에서 `O(p)`로 줄었고, 다음 묶음도 한 번에 `O(p)`씩 추가됩니다. 스와이프 판정과 팝오버 위치 계산은 `O(1)`입니다. 마지막에는 ARIA tab, 방향키·Home·End, `inert`, reduced motion까지 같은 동작 흐름에서 점검해 WordPress 웹과 Android WebView의 조작 방식을 맞췄습니다.

```mermaid
flowchart TD
    Goal["목표 · WordPress와 Android에서 같은 작업 UX"] --> Simple["1차 구현 · 전체 마운트 + 네이티브 scroll-snap"]
    Simple --> Failure["문제 · CSS 충돌 · 큰 초기 DOM<br/>대각선 오작동 · 다중 패널 이동 · popover 잘림"]
    Failure --> Isolation["호스트 CSS를 workspace root에서 격리"]
    Failure --> Navigation["48px · 1.4배 조건으로 수평 의도 판정"]
    Failure --> Rendering["방문 패널 지연 마운트<br/>목록은 p개씩 점진 렌더링"]
    Failure --> Details["공용 store + Portal로 상세 정보 분리"]
    Navigation --> Adjacent["항상 인접 패널 하나만 이동"]
    Rendering --> Observer["IntersectionObserver로 다음 p개 추가"]
    Details --> Position["viewport 배치 · Escape · focus 복귀"]
    Isolation --> Result["웹·앱 공통 조작 계약"]
    Adjacent --> Result
    Observer --> Result
    Position --> Result
    Result --> Complexity["초기 렌더링 O(p)<br/>스와이프·위치 계산 O(1)"]
```

관련 코드: [`workspace/hooks/useWorkspaceCarousel.ts`](./workspace/hooks/useWorkspaceCarousel.ts), [`workspace/carouselNavigation.ts`](./workspace/carouselNavigation.ts), [`selector/hooks/useProgressiveRenderCount.ts`](./selector/hooks/useProgressiveRenderCount.ts), [`details/DetailPopover.tsx`](./details/DetailPopover.tsx), [`styles/wordpressButtonIsolation.css`](./styles/wordpressButtonIsolation.css)

## 검증 방법

```bash
npm run test:core
npm run lint
npm run build
```

핵심 테스트는 조합 순서와 OP 점수, runtime schema·이미지 경계, 마지막 정상 snapshot 복구, baseId 상호 배타, 추천 서명 무효화, 다국어 catalog 병합, 기기 언어 판정, 모바일 제스처, 점진 렌더링, WordPress 스타일 격리를 확인합니다. 프로덕션 빌드는 같은 `dist`가 WordPress 플러그인과 Capacitor Android 동기화의 입력으로 사용될 수 있는지도 함께 검증합니다.
