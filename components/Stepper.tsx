"use client";

export type StageKey = "1" | "2" | "2b" | "3" | "4" | "5" | "6";

const DOT_MAP: Record<StageKey, number> = { "1": 1, "2": 2, "2b": 2, "3": 3, "4": 4, "5": 5, "6": 6 };
const DOT_TARGET: Record<number, StageKey> = { 1: "1", 2: "2b", 3: "3", 4: "4", 5: "5", 6: "6" };

export default function Stepper({
  currentStage,
  maxDot,
  hasData,
  onNavigate,
  onEdit,
}: {
  currentStage: StageKey;
  maxDot: number;
  hasData: boolean;
  onNavigate: (s: StageKey) => void;
  onEdit: () => void;
}) {
  const cur = DOT_MAP[currentStage] || 1;
  return (
    <div className="stepper">
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const canClick = i <= maxDot;
        const cls = "step-dot" + (i < cur ? " done" : i === cur ? " active" : "") + (canClick ? " clickable" : "");
        return (
          <div
            key={i}
            className={cls}
            title={canClick ? "Ir para esta etapa" : undefined}
            onClick={() => {
              if (!canClick) return;
              if (i === 2 && hasData) onEdit();
              else onNavigate(DOT_TARGET[i]);
            }}
          />
        );
      })}
    </div>
  );
}
