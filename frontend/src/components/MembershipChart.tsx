/**
 * Membership function visualization chart
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';

interface MembershipChartProps {
  title: string;
  xValues: number[];
  curves: { [key: string]: number[] };
  currentValue?: number;
  unit?: string;
  colors?: { [key: string]: string };
}

const DEFAULT_COLORS: { [key: string]: string } = {
  // 污泥: SD=Small(低), MD=Medium(中), LD=Large(高)
  SD: '#d97706',  // 深橘 (低)
  MD: '#059669',  // 深綠 (中)
  LD: '#2563eb',  // 深藍 (高)
  // 油污: NG=No Grease(低), MG=Medium(中), LG=Large(高)
  NG: '#d97706',  // 深橘 (低)
  MG: '#059669',  // 深綠 (中)
  LG: '#2563eb',  // 深藍 (高)
  // 清洗時間
  VS: '#7c3aed',  // 深紫 (極短)
  S: '#2563eb',   // 深藍 (短)
  M: '#059669',   // 深綠 (中)
  L: '#d97706',   // 深橘 (長)
  VL: '#dc2626',  // 深紅 (極長)
};

export function MembershipChart({
  title,
  xValues,
  curves,
  currentValue,
  unit = '',
  colors = DEFAULT_COLORS
}: MembershipChartProps) {
  // Transform data for Recharts
  const data = xValues.map((x, i) => {
    const point: any = { x };
    Object.keys(curves).forEach(key => {
      point[key] = curves[key][i];
    });
    return point;
  });

  return (
    <div className="membership-chart">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="x"
            label={{ value: unit, position: 'insideBottom', offset: -35, style: { fontSize: 14, fontWeight: 600, fill: '#cbd5e1' } }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(value) => Math.round(value).toString()}
            height={60}
            stroke="rgba(148, 163, 184, 0.3)"
          />
          <YAxis
            domain={[0, 1]}
            label={{ value: 'μ', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600, fill: '#cbd5e1' } }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            width={50}
            stroke="rgba(148, 163, 184, 0.3)"
          />
          <Tooltip
            formatter={(value: any) => value.toFixed(3)}
            labelFormatter={(label) => `${unit}: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 8,
              color: '#e2e8f0'
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="line"
            wrapperStyle={{ paddingBottom: 10 }}
          />

          {currentValue !== undefined && (
            <ReferenceLine
              x={currentValue}
              stroke="red"
              strokeDasharray="5 5"
              label={{ value: currentValue.toFixed(0), fill: 'red' }}
            />
          )}

          {Object.keys(curves).map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key] || '#888'}
              strokeWidth={3}
              dot={false}
              name={key}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
