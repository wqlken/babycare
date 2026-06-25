import Link from "next/link";

type QuickActionsProps = {
  childId: string;
};

export function QuickActions({ childId }: QuickActionsProps) {
  const actions = [
    { href: `/children/${childId}/feedings/new`, label: "喂养" },
    { href: `/children/${childId}/diapers/new`, label: "尿布" },
    { href: `/children/${childId}/sleep`, label: "睡眠" },
    { href: `/children/${childId}/timeline`, label: "时间线" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          className="rounded bg-slate-950 px-4 py-4 text-center font-medium text-white"
          href={action.href}
          key={action.href}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
