import { Search } from "lucide-react";

import { typography } from "../../../styles/typography";
import { radius } from "../../../styles/tokens";

import type { SelectorMode } from "../../../store/useSelectorModeStore";

interface Props {
  query: string;
  setQuery: (value: string) => void;
  mode: SelectorMode;
}

export default function SearchBar({ query, setQuery, mode }: Props) {
  const placeholderText = mode === 'candidate' ? "후보 챔피언 검색" : "고정 챔피언 검색";
  const focusRing = mode === 'candidate' ? "focus:border-purple-500/50" : "focus:border-rose-500/60";

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholderText}

        className={`
          w-full pl-12 pr-4 h-12 md:h-14
          bg-white/10 border border-white/10 ${radius.xl}
          ${typography.body} text-white
          focus:bg-white/15 ${focusRing} outline-none transition-all
        `}
      />
    </div>
  );
}
