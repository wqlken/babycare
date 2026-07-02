import Link from "next/link";

type QuickActionsProps = {
  childId: string;
};

export function QuickActions({ childId }: QuickActionsProps) {
  const actions = [
    { href: `/children/${childId}/feedings/new`, label: "喂养", tone: "bg-[var(--primary)]" },
    { href: `/children/${childId}/diapers/new`, label: "尿布", tone: "bg-[var(--accent)]" },
    { href: `/children/${childId}/sleep`, label: "睡眠", tone: "bg-[#8584a6]" },
    { href: `/children/${childId}/timeline`, label: "时间线", tone: "bg-[#8d877e]" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          className={`${action.tone} flex min-h-16 items-center justify-center rounded-lg px-4 py-5 text-center text-lg font-semibold text-white shadow-sm active:shadow-none`}
          href={action.href}
          key={action.href}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
