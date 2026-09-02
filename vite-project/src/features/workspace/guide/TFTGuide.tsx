import {
  BadgePlus,
  ChevronRight,
  Coins,
  Compass,
  ExternalLink,
  LockKeyhole,
  Search,
  Shuffle,
  Sparkles,
  Smartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { GuideSectionId, GuideWorkflowId } from "./guideLocales";
import { useAppI18n } from "../../i18n/useAppI18n";
import "./TFTGuide.css";

interface GuideSectionPresentation {
  readonly id: GuideSectionId;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly badge: string;
}

const WORKFLOW: readonly GuideWorkflowId[] = [
  "choose",
  "required",
  "recommend",
  "save",
];

const GUIDE_SECTIONS: readonly GuideSectionPresentation[] = [
  {
    id: "navigation",
    icon: Compass,
    accent: "border-sky-400",
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  },
  {
    id: "teamBuilder",
    icon: Sparkles,
    accent: "border-violet-400",
    badge: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  },
  {
    id: "candidates",
    icon: Users,
    accent: "border-emerald-400",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  {
    id: "fixed",
    icon: LockKeyhole,
    accent: "border-amber-300",
    badge: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  },
  {
    id: "traits",
    icon: BadgePlus,
    accent: "border-pink-400",
    badge: "border-pink-400/30 bg-pink-400/10 text-pink-200",
  },
];

const GUIDE_TOOL_ICONS: readonly LucideIcon[] = [Search, Coins, Shuffle];

export default function TFTGuide() {
  const { guide: copy } = useAppI18n();

  return (
    <article className="tft-guide mb-8 w-full text-slate-200">
      <header className="tft-guide__reveal border-b border-white/10 px-3 pb-7 pt-5 sm:px-6 sm:pb-9 md:px-8">
        <div className="mb-4 flex flex-wrap items-start gap-3">
          <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs font-bold text-white/75">
            <Sparkles aria-hidden="true" size={14} />
            TFT TEAM OPTIMIZER
          </span>
        </div>

        <h1 className="max-w-3xl break-words text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-3xl break-words text-sm leading-7 text-slate-300 sm:text-base">
          {copy.introduction}
        </p>

        <a
          href="https://play.google.com/store/apps/details?id=com.UrsusCertamen.TFTool"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex min-h-14 w-full max-w-md items-center gap-3 rounded-lg border border-violet-200/30 bg-violet-400 px-4 py-3 text-left text-slate-950 shadow-[0_10px_30px_rgba(167,139,250,0.22)] transition-colors hover:bg-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-[360px]"
        >
          <Smartphone aria-hidden="true" size={22} className="shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block break-words text-sm font-black">
              {copy.appTitle}
            </span>
            <span className="mt-0.5 block break-words text-xs font-semibold text-slate-800">
              {copy.appDescription}
            </span>
          </span>
          <ExternalLink aria-hidden="true" size={17} className="shrink-0" />
        </a>

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-400 sm:text-sm">
          {copy.tools.map((label, index) => {
            const Icon = GUIDE_TOOL_ICONS[index];
            if (!Icon) return null;

            return (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon aria-hidden="true" size={15} className="text-white/70" />
                {label}
              </li>
            );
          })}
        </ul>
      </header>

      <section
        aria-labelledby="tft-guide-workflow"
        className="tft-guide__reveal border-b border-white/10 px-3 py-7 sm:px-6 md:px-8"
      >
        <h2
          id="tft-guide-workflow"
          className="text-sm font-black text-white sm:text-base"
        >
          {copy.workflowTitle}
        </h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {WORKFLOW.map((id, index) => {
            const step = copy.workflow[id];

            return (
              <li key={id} className="relative min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-black text-black">
                    {index + 1}
                  </span>
                  <h3 className="break-words text-sm font-bold text-white">
                    {step.title}
                  </h3>
                  {index < WORKFLOW.length - 1 && (
                    <ChevronRight
                      aria-hidden="true"
                      size={16}
                      className="ml-auto hidden text-white/25 xl:block"
                    />
                  )}
                </div>
                <p className="mt-2 break-words pl-9 text-xs leading-5 text-slate-400 sm:text-sm">
                  {step.detail}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="px-3 py-3 sm:px-6 md:px-8">
        <ul className="tft-guide__section-list divide-y divide-white/10">
          {GUIDE_SECTIONS.map(({ id, icon: Icon, accent, badge }) => {
            const section = copy.sections[id];

            return (
              <li
                key={id}
                className={`tft-guide__section border-l-2 ${accent} py-7 pl-4 sm:py-8 sm:pl-6`}
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon aria-hidden="true" size={19} className="text-white" />
                      <h2 className="break-words text-base font-black text-white sm:text-lg">
                        {section.title}
                      </h2>
                      <span
                        className={`max-w-full break-words rounded-md border px-2 py-1 text-[10px] font-black uppercase sm:text-xs ${badge}`}
                      >
                        {section.label}
                      </span>
                    </div>
                    <p className="mt-3 break-words text-sm leading-6 text-slate-300">
                      {section.description}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {section.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-sm leading-6 text-slate-400"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/55"
                        />
                        <span className="min-w-0 break-words">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="tft-guide__reveal mx-3 mt-3 border-t border-white/10 px-1 py-7 sm:mx-6 md:mx-8">
        <p className="max-w-2xl break-words text-xs leading-6 text-slate-400 sm:text-sm">
          {copy.footer}
        </p>
      </footer>
    </article>
  );
}
