import { Search } from "lucide-react";
import { typography } from "../../../styles/typography";
import { radius } from "../../../styles/tokens";
import { useAppI18n } from "../../../i18n/useAppI18n";

interface Props {
  query: string;
  setQuery: (value: string) => void;
  placeholder?: string;
}

export default function TraitSearchBar({ query, setQuery, placeholder }: Props) {
  const { copy } = useAppI18n();
  const inputPlaceholder = placeholder ?? copy.traits.searchPlaceholder;

  return (
    <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
      <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        type="search"
        aria-label={copy.traits.searchAria}
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={inputPlaceholder}
        className={`
          w-full pl-9 pr-3 h-10
          bg-white/10 border border-white/10 ${radius.lg}
          ${typography.body} text-white
          focus:bg-white/15 focus:border-amber-600/60 
          focus:shadow-[0_0_10px_rgba(244,63,94,0.2)] 
          outline-none transition-all
        `}
      />
    </div>
  );
}
