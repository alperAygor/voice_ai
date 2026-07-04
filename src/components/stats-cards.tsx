interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
}

export function StatsCard({ title, value, subtitle, trend }: StatsCardProps) {
  return (
    <div className="dashboard-card interactive-lift min-h-32 rounded-lg p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend !== undefined && (
          <span
            className={`text-sm font-medium ${
              trend > 0
                ? "text-green-600"
                : trend < 0
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : ""} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
