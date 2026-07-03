import { Baby, Clock3, Milk, Moon } from "lucide-react";
import Link from "next/link";

type QuickActionsProps = {
  childId: string;
};

export function QuickActions({ childId }: QuickActionsProps) {
  const actions = [
    {
      href: `/children/${childId}/feedings/new`,
      label: "喂养",
      Icon: Milk,
      tone: "bg-[var(--accent-feeding)]",
    },
    {
      href: `/children/${childId}/diapers/new`,
      label: "尿布",
      Icon: Baby,
      tone: "bg-[var(--accent-diaper)]",
    },
    {
      href: `/children/${childId}/sleep`,
      label: "睡眠",
      Icon: Moon,
      tone: "bg-[var(--accent-sleep)]",
    },
    {
      href: `/children/${childId}/timeline`,
      label: "时间线",
      Icon: Clock3,
      tone: "bg-[var(--action-neutral)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.Icon;

        return (
          <Link
            className={`${action.tone} bc-focus-ring flex min-h-16 items-center justify-center gap-2 rounded-lg px-4 py-5 text-center text-lg font-semibold text-white shadow-sm active:shadow-none`}
            href={action.href}
            key={action.href}
          >
            <Icon aria-hidden="true" size={28} />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
