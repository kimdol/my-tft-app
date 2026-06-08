import { Search } from "lucide-react";
import { typography } from "../../../styles/typography";
import { radius } from "../../../styles/tokens";

interface Props {
  query: string;
  setQuery: (value: string) => void;
  placeholder?: string;
}

export default function TraitSearchBar({ query, setQuery, placeholder = "특성 검색" }: Props) {
  return (
    <div className="relative w-full sm:w-64 shrink-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
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