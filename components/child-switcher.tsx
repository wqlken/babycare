import { setCurrentChildAction } from "@/app/actions/children";
import type { listAccessibleChildren } from "@/lib/children/service";
import { formatChildAge } from "@/lib/time";

type ChildSwitcherProps = {
  childrenList: Awaited<ReturnType<typeof listAccessibleChildren>>;
  currentChildId?: string;
};

export function ChildSwitcher({
  childrenList,
  currentChildId,
}: ChildSwitcherProps) {
  const currentChild =
    childrenList.find((child) => child.id === currentChildId) ?? childrenList[0];

  return (
    <div className="min-w-0">
      <p className="text-sm text-slate-500">当前宝宝</p>
      <p className="text-base font-semibold">
        {currentChild
          ? `${currentChild.name} · ${formatChildAge({ birthday: currentChild.birthday })}`
          : "未创建"}
      </p>
      {childrenList.length > 1 ? (
        <form action={setCurrentChildAction} className="mt-2">
          <select
            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
            defaultValue={currentChild?.id}
            name="childId"
          >
            {childrenList.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
          <button className="mt-2 rounded border border-slate-300 px-2 py-1 text-sm font-medium">
            切换
          </button>
        </form>
      ) : null}
    </div>
  );
}
