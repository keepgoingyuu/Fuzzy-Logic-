/**
 * Aggregated output and defuzzification visualization
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import StraightenIcon from '@mui/icons-material/Straighten';

interface OutputChartProps {
  xValues: number[];
  yValues: number[];
  centroid: number;
  title?: string;
}

export function OutputChart({
  xValues,
  yValues,
  centroid,
  title = '解模糊化輸出'
}: OutputChartProps) {
  // Transform data for Recharts
  const data = xValues.map((x, i) => ({
    x,
    membership: yValues[i]
  }));

  return (
    <div className="output-chart">
      <h2>
        <BarChartIcon sx={{ fontSize: 28, marginRight: 1, verticalAlign: 'middle' }} />
        {title}
      </h2>
      <div className="result-display">
        <div className="result-value">
          <span className="result-label">清洗時間</span>
          <span className="result-number">{centroid.toFixed(2)}</span>
          <span className="result-unit">分鐘</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 50 }}
        >
          <defs>
            <linearGradient id="colorMembership" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="x"
            label={{ value: '時間 (分鐘)', position: 'insideBottom', offset: -35, style: { fontSize: 14, fontWeight: 600, fill: '#cbd5e1' } }}
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
            labelFormatter={(label) => `時間: ${label} 分鐘`}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 8,
              color: '#e2e8f0'
            }}
          />

          <ReferenceLine
            x={centroid}
            stroke="red"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `COG: ${centroid.toFixed(2)}`,
              fill: 'red',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          />

          <Area
            type="monotone"
            dataKey="membership"
            stroke="#0ea5e9"
            strokeWidth={3}
            fill="url(#colorMembership)"
            name="聚合輸出"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="method-info">
        <p>
          <StraightenIcon sx={{ fontSize: 18, marginRight: 0.5, verticalAlign: 'middle' }} />
          使用<strong>重心法 (Center of Gravity)</strong>進行解模糊化
        </p>
        <p className="formula">y⁰ = ∫μ(y)·y dy / ∫μ(y) dy</p>
      </div>
    </div>
  );
}
