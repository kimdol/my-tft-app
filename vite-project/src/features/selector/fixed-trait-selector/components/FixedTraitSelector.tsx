import { useState } from "react";
import TraitItem from "./TraitItem";
import TraitSearchBar from "./TraitSearchBar";
import { useTraitSelector } from "../hooks/useTraitSelector";
import { typography } from "../../../styles/typography";

export default function FixedTraitSelector() {
  const [query, setQuery] = useState("");
  const { filtered, totalSelectedCount } = useTraitSelector(query);

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-3">
        <div>
          <h2
            className={`${typography.heading} font-black text-white flex items-center gap-2`}
          >
            추가 상징

            {totalSelectedCount > 0 && (
              <span className="text-sm font-bold bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                {totalSelectedCount}개 선택 중..
              </span>
            )}
          </h2>
          <span className="text-sm font-medium text-white/40">
            +/- 버튼으로 수치 조절
          </span>
        </div>

        <TraitSearchBar query={query} setQuery={setQuery} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
        {filtered.map((trait) => (
          <TraitItem key={trait.apiName} trait={trait} />
        ))}
      </div>
    </div>
  );
}
