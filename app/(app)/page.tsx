import { requireUser } from "@/lib/auth/guards";
import {
  getChildDashboardTarget,
  listAccessibleChildren,
} from "@/lib/children/service";

export default async function Home() {
  const user = await requireUser();
  const target = await getChildDashboardTarget(user.id);
  const children = await listAccessibleChildren(user.id);
  const currentChild =
    target.kind === "child"
      ? children.find((child) => child.id === target.childId)
      : null;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-sky-700">Babycare</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          {currentChild?.name ?? "宝宝"} 的今日记录
        </h1>
        <p className="mt-2 text-slate-600">
          喂养、尿布和睡眠快捷记录将在下一阶段接入。
        </p>
      </div>
    </section>
  );
}
