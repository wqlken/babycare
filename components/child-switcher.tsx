import type { listAccessibleChildren } from "@/lib/children/service";

type ChildSwitcherProps = {
  childrenList: Awaited<ReturnType<typeof listAccessibleChildren>>;
};

function formatAge(birthday: Date) {
  const now = new Date();
  const ageInDays = Math.max(
    0,
    Math.floor((now.getTime() - birthday.getTime()) / 86_400_000),
  );

  if (ageInDays < 60) {
    return `${ageInDays}天`;
  }

  return `${Math.floor(ageInDays / 30)}个月`;
}

export function ChildSwitcher({ childrenList }: ChildSwitcherProps) {
  const currentChild = childrenList[0];

  return (
    <div>
      <p className="text-sm text-slate-500">当前宝宝</p>
      <p className="text-base font-semibold">
        {currentChild ? `${currentChild.name} · ${formatAge(currentChild.birthday)}` : "未创建"}
      </p>
    </div>
  );
}
