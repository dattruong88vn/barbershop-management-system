export function VisitInfoRow({
  label,
  value,
  valueClassName = "font-medium",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`min-w-0 text-right text-foreground ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
