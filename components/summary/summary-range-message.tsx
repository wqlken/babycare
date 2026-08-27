type SummaryRangeMessageProps = {
  error?: string;
};

export function SummaryRangeMessage({ error }: SummaryRangeMessageProps) {
  if (!error) return null;

  return (
    <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      {error}
    </p>
  );
}
