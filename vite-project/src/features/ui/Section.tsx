export default function Section({ title, children, id }: any) {
  return (
    <section id={id}>
      <h1 
        className="text-xl sm:text-[1.8rem] text-white mb-5 tracking-tight leading-[1.4] select-none"
        style={{ 
          fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
          fontWeight: 900,
          WebkitFontSmoothing: "auto",
          MozOsxFontSmoothing: "auto",
          textShadow: "0 0 1px rgba(255,255,255,0.3)"
        }}
      >
        {title}
      </h1>
      {children}
    </section>
  );
}
