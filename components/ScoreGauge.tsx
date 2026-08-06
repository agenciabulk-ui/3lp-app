"use client";

import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

function colorFromScore(v: number) {
  if (v >= 75) return "#34A853";
  if (v >= 50) return "#F9AB00";
  return "#EA4335";
}

export default function ScoreGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    setAnimated(0);
    const t = setTimeout(() => setAnimated(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  const color = colorFromScore(score);
  const data = [{ value: animated }];

  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      <RadialBarChart
        width={180}
        height={180}
        cx="50%"
        cy="50%"
        innerRadius="78%"
        outerRadius="100%"
        barSize={14}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background={{ fill: "#EDEEF0" }} dataKey="value" cornerRadius={20} fill={color} isAnimationActive={true} />
      </RadialBarChart>
      <div className="gauge-label">
        <div className="gauge-num">{Math.round(animated)}</div>
        <div className="gauge-den">/ 100</div>
      </div>
    </div>
  );
}
