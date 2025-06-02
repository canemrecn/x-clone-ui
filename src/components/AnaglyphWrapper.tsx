// src/components/AnaglyphWrapper.tsx
export default function AnaglyphWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        className="absolute left-[2px] top-0 z-10 opacity-50 text-red-600 pointer-events-none"
        aria-hidden="true"
      >
        {children}
      </div>
      <div
        className="absolute left-[-2px] top-0 z-20 opacity-50 text-cyan-600 pointer-events-none"
        aria-hidden="true"
      >
        {children}
      </div>
      <div className="relative z-30">{children}</div>
    </div>
  );
}
