interface Props {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}

export function Sparkline({ data, width = 320, height = 80, stroke = "#0F5132", fill = "rgba(15,81,50,0.12)" }: Props) {
  if (data.length === 0) {
    return <div className="text-sm text-ink/60">No data yet.</div>;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath = `M0,${height} L${points.join(" L")} L${width},${height} Z`;
  const linePath = `M${points.join(" L")}`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sales trend">
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={2} />
    </svg>
  );
}
