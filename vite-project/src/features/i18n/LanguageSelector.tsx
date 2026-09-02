import { ChevronDown, Languages } from "lucide-react";
import { useAppI18n } from "./useAppI18n";

export default function LanguageSelector() {
  const { copy, languageOptions, locale, setLocale } = useAppI18n();
  const selectedLanguage = languageOptions.find(
    (option) => option.id === locale,
  );

  return (
    <label
      data-tft-language-selector
      className="relative inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-violet-200/55 bg-violet-400/20 px-3.5 text-sm font-black text-white shadow-[0_0_18px_rgba(167,139,250,0.22)] transition-colors hover:bg-violet-400/30 focus-within:border-white focus-within:bg-violet-400/35"
    >
      <Languages aria-hidden="true" size={18} className="shrink-0 text-violet-100" />
      <span className="hidden whitespace-nowrap text-violet-100 sm:inline">
        {copy.language.shortLabel}
      </span>
      <span className="whitespace-nowrap text-white">
        {selectedLanguage?.label}
      </span>
      <ChevronDown
        aria-hidden="true"
        size={15}
        className="shrink-0 text-violet-100"
      />
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        aria-label={copy.language.label}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {languageOptions.map((option) => (
          <option key={option.id} value={option.id} className="bg-slate-950 text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
