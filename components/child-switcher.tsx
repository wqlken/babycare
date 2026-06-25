import type { listAccessibleChildren } from "@/lib/children/service";
import { formatChildAge } from "@/lib/time";

type ChildSwitcherProps = {
  childrenList: Awaited<ReturnType<typeof listAccessibleChildren>>;
};

export function ChildSwitcher({ childrenList }: ChildSwitcherProps) {
  const currentChild = childrenList[0];

  return (
    <div>
      <p className="text-sm text-slate-500">当前宝宝</p>
      <p className="text-base font-semibold">
        {currentChild
          ? `${currentChild.name} · ${formatChildAge({ birthday: currentChild.birthday })}`
          : "未创建"}
      </p>
    </div>
  );
}
