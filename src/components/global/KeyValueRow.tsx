import { Paragraph } from "@/components/global/Typography";

export function KeyValueRow({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
      <Paragraph tone="muted">{title}</Paragraph>
      <Paragraph className="truncate text-right" weight="semibold">
        {value}
      </Paragraph>
    </div>
  );
}
