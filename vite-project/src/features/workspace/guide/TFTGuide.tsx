export default function TFTGuide() {
  return (
    <article className="bg-[#121216] text-[#e2e8f0] font-sans p-4 md:p-10 rounded-[16px] border border-[#2d2d3d] w-full mb-6 shadow-[0_10px_25px_rgba(0,0,0,0.5)] box-border">
      <header className="mb-3">
        <h1 className="text-[1.4rem] md:text-[1.8rem] font-black text-white mb-3 leading-[1.4] break-keep">
          시너지충들을 위한{" "}
          <span className="text-[#a855f7] inline-block">
            TFT 팀 조합 추천 툴
          </span>
        </h1>
        <p className="text-[0.85rem] md:text-[0.95rem] text-[#94a3b8] leading-[1.6] mb-8 border-b border-[#2d2d3d] pb-5 break-keep">
          롤토체스(TFT)에서 빈틈없는 완벽한 시뮬레이션을 원하는 유저들을 위한
          강력한{" "}
          <strong className="text-[#fbbf24] font-bold">시너지 계산기</strong>
          입니다. 원하는 후보 유닛들과 무조건 포함할 고정 유닛, 추가 상징을
          설정하여 특성이 최대로 활성화되는 최적의 덱 조합을 탐색해 보세요.
        </p>
      </header>

      <section className="flex flex-col gap-5 mb-8">
        <div className="bg-[#1a1a23] p-4 md:p-[1.2rem] rounded-xl border-l-4 border-[#3b82f6] transition-all duration-200 hover:translate-x-1 hover:bg-[#22222f]">
          <div className="text-base md:text-[1.1rem] font-bold text-[#f3f4f6] mb-2 flex items-center flex-wrap gap-2">
            📱 탭 이동 메뉴{" "}
            <span className="text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap bg-[#1e3a8a] text-[#93c5fd]">
              네비게이션
            </span>
          </div>
          <div className="text-[0.85rem] md:text-[0.95rem] text-[#94a3b8] leading-[1.6] break-keep">
            상단의{" "}
            <strong className="text-white">
              가이드, 조합 추천, 후보 유닛, 고정 유닛, 추가 상징
            </strong>{" "}
            버튼을 눌러 각 작업 영역으로 빠르게 이동할 수 있습니다. 모바일
            환경에서 메뉴가 잘려 보일 경우{" "}
            <strong className="text-[#fbbf24] font-bold">좌우로 스크롤</strong>
            하면 숨겨진 메뉴들이 나타납니다.
          </div>
        </div>

        <div className="bg-[#1a1a23] p-4 md:p-[1.2rem] rounded-xl border-l-4 border-[#a855f7] transition-all duration-200 hover:translate-x-1 hover:bg-[#22222f]">
          <div className="text-base md:text-[1.1rem] font-bold text-[#f3f4f6] mb-2 flex items-center flex-wrap gap-2">
            📊 조합 추천 영역{" "}
            <span className="text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap bg-[#a855f7] text-white">
              알고리즘 연산
            </span>
          </div>
          <div className="text-[0.85rem] md:text-[0.95rem] text-[#94a3b8] leading-[1.6] space-y-2 break-keep">
            <p>
              설정한 인원수, 구성원(후보/고정), 추가 상징 정보를 종합하여
              시너지가 가장 많이 활성화되는 최적의 조합을 계산합니다.
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#cbd5e1] space-y-1 ml-1">
              <li>
                <strong className="text-[#fbbf24]">인원 수 입력란:</strong> 최종
                빌드 타겟팅 인원(레벨 및 덱 스페이스)을 입력해 최적화 규모를
                결정합니다.
              </li>
              <li>
                <strong className="text-[#fbbf24]">최적 팀 구성 버튼:</strong>{" "}
                조건에 부합하는 최고의 시너지 조합 리스트를 실시간 계산하여
                출력합니다.
              </li>
              <li>
                <strong className="text-[#fbbf24]">구성 적용 버튼:</strong>{" "}
                추천된 조합을 터치 한 번으로 유닛 선택창에 즉시 자동 반영합니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[#1a1a23] p-4 md:p-[1.2rem] rounded-xl border-l-4 border-[#10b981] transition-all duration-200 hover:translate-x-1 hover:bg-[#22222f]">
          <div className="text-base md:text-[1.1rem] font-bold text-[#f3f4f6] mb-2 flex items-center flex-wrap gap-2">
            👥 후보 유닛 영역{" "}
            <span className="text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap bg-[#065f46] text-[#a7f3d0]">
              챔피언 풀 빌딩
            </span>
          </div>
          <div className="text-[0.85rem] md:text-[0.95rem] text-[#94a3b8] leading-[1.6] space-y-2 break-keep">
            <p>
              이번 판에 집어둔 챔피언, 빌드업용 챔피언, 또는 평소 고평가하는 유닛들을 자유롭게 수집하는 영역입니다.
            </p>
            <p className="mt-1 text-[0.8rem] text-[#cbd5e1] md:text-[0.9rem]">
              💡 <strong className="text-[#fbbf24] ">활용 꿀팁:</strong> 1~2코스트 저코스트 기물들을 폭넓게 많이 
              선택해 보세요. 유튜브나 공략 사이트의 정석 덱이 겹쳐서 안 나올 때,
              알고리즘이 시너지가 꽉 찬 나만의 새로운 대체 덱을 대신 찾아줍니다!
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#cbd5e1] space-y-1 ml-1">
              <li>
                <strong className="text-[#fbbf24]">
                  후보 카드 수 & 전체 삭제:
                </strong>{" "}
                현재 등록된 수치를 확인하고 필요 시 한 번에 비울 수 있습니다.
              </li>
              <li>
                <strong className="text-[#fbbf24]">스마트 검색란:</strong>{" "}
                챔피언 이름(<span className="text-white">'이즈리얼'</span> ➔{" "}
                <span className="text-white">'이즈'</span>,{" "}
                <span className="text-white">'ㅇㅈㄹㅇ'</span>,{" "}
                <span className="text-white">'ㅇㅈ'</span>)뿐만 아니라{" "}
                <strong className="text-[#a7f3d0]">
                  특성(상징/시너지) 이름
                </strong>
                도 동일한 방식으로 스마트하게 필터링됩니다. (예:{" "}
                <span className="text-white">'도전자'</span> ➔{" "}
                <span className="text-white">'도전'</span>,{" "}
                <span className="text-white">'ㄷㅈㅈ'</span>,{" "}
                <span className="text-white">'ㄷㅈ'</span>)
              </li>
              <li>
                <strong className="text-[#fbbf24]">챔피언 모음:</strong> 챔피언
                카드를 클릭하여 후보군에 추가하거나 제외합니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[#1a1a23] p-4 md:p-[1.2rem] rounded-xl border-l-4 border-[#f59e0b] transition-all duration-200 hover:translate-x-1 hover:bg-[#22222f]">
          <div className="text-base md:text-[1.1rem] font-bold text-[#f3f4f6] mb-2 flex items-center flex-wrap gap-2">
            📌 고정 유닛 영역{" "}
            <span className="text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap bg-[#78350f] text-[#fde68a]">
              필수 포함 유닛
            </span>
          </div>
          <div className="text-[0.85rem] md:text-[0.95rem] text-[#94a3b8] leading-[1.6] space-y-2 break-keep">
            <p>
              이미 3성작이 끝났거나 특정 기물을 중심으로 덱을 구성해야 할 때,{" "}
              <strong className="text-white">
                최적 덱 계산 시 무조건 포함될 유닛
              </strong>
              을 지정합니다.
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#cbd5e1] space-y-1 ml-1">
              <li>
                후보 유닛 영역과 동일하게{" "}
                <strong className="text-[#fbbf24]">
                  초성/축약어 스마트 검색
                </strong>{" "}
                기능 및 전체 초기화 버튼을 완벽히 지원합니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[#1a1a23] p-4 md:p-[1.2rem] rounded-xl border-l-4 border-[#ec4899] transition-all duration-200 hover:translate-x-1 hover:bg-[#22222f]">
          <div className="text-base md:text-[1.1rem] font-bold text-[#f3f4f6] mb-2 flex items-center flex-wrap gap-2">
            👑 추가 상징 영역{" "}
            <span className="text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap bg-[#9d174d] text-[#fbcfe8]">
              증강체 및 뒤집개
            </span>
          </div>
          <div className="text-[0.85rem] md:text-[0.95rem] text-[#94a3b8] leading-[1.6] space-y-2 break-keep">
            <p>
              차원문 효과나 증강체, 뒤집개 아이템으로 얻은 추가 상징 및 문장
              개수를 연산에 포함하는 곳입니다.
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#cbd5e1] space-y-1 ml-1">
              <li>
                <strong className="text-[#fbbf24]">상징 검색:</strong>{" "}
                <span className="text-white">'도전자'</span> 검색 시 정석 명칭
                외에 <span className="text-white">'도전'</span>, 초성{" "}
                <span className="text-white">'ㄷㅈ'</span>,{" "}
                <span className="text-white">'ㄷㅈㅈ'</span>로도 빠르게 조회가
                가능합니다.
              </li>
              <li>
                <strong className="text-[#fbbf24]">수치 조절 (+/-):</strong> 각
                상징 카드 우측의 스텝 버튼을 사용하여 상징 획득 개수를 간편하게
                증감시킵니다.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-[#1e1b4b] to-[#111827] p-5 md:p-6 rounded-xl border border-dashed border-[#4c1d95] text-center">
        <p className="text-[0.85rem] md:text-[0.9rem] text-[#c084fc] m-0 leading-[1.6] break-keep">
          💡{" "}
          <strong className="text-[#fbbf24] font-bold">
            추가 기능 제안 및 기타 문의 사항이 있으신가요?
          </strong>
          <br />
          필터링 로직 고도화나 커스텀 기능 등 서비스 발전을 위한 모든 피드백과
          문의를 언제나 환영합니다.
        </p>
      </footer>
    </article>
  );
}
