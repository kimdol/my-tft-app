import { Search } from "lucide-react";

import { typography } from "../../../styles/typography";
import { radius } from "../../../styles/tokens";
import type { ChampionSelectorStrategy } from "../selectorStrategies";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface Props {
  query: string;
  setQuery: (value: string) => void;
  strategy: ChampionSelectorStrategy;
}

export default function SearchBar({ query, setQuery, strategy }: Props) {
  const { copy } = useAppI18n();
  const placeholder = copy.selector[strategy.id].searchPlaceholder;

  return (
    <div className="relative w-full">
      <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="search"
        aria-label={placeholder}
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}

        className={`
          w-full pl-12 pr-4 h-12 md:h-14
          bg-white/10 border border-white/10 ${radius.xl}
          ${typography.body} text-white
          focus:bg-white/15 ${strategy.searchFocusBorder} outline-none transition-all
        `}
      />
    </div>
  );
}
