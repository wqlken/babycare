import { getGrowthToneClass } from "@/lib/growth/view-model";

type GrowthReferencePanelProps = {
  hasReferenceSex: boolean;
  lengthAssessment: string;
  weightAssessment: string;
};

export function GrowthReferencePanel({
  hasReferenceSex,
  lengthAssessment,
  weightAssessment,
}: GrowthReferencePanelProps) {
  return (
    <div className="bc-card space-y-3 p-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          参考提示
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          当前依据宝宝性别和测量日龄显示 -2SD 到 +2SD 区间提示。
        </p>
      </div>
      {!hasReferenceSex ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          宝宝资料未填写男/女性别，暂不显示标准参考提示。
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <p
          className={`rounded border px-3 py-2 text-sm ${getGrowthToneClass(
            weightAssessment,
          )}`}
        >
          体重：{weightAssessment}
        </p>
        <p
          className={`rounded border px-3 py-2 text-sm ${getGrowthToneClass(
            lengthAssessment,
          )}`}
        >
          身长/身高：{lengthAssessment}
        </p>
      </div>
    </div>
  );
}
