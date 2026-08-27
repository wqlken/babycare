type GrowthPageMessagesProps = {
  error?: string;
  saved?: string;
};

export function GrowthPageMessages({ error, saved }: GrowthPageMessagesProps) {
  return (
    <>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          已保存生长记录。
        </p>
      ) : null}
    </>
  );
}
