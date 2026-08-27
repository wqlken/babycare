type GrowthPageHeaderProps = {
  childName: string;
};

export function GrowthPageHeader({ childName }: GrowthPageHeaderProps) {
  return (
    <div className="bc-card px-4 py-5">
      <p className="text-sm font-medium text-[var(--accent-growth-strong)]">
        生长记录
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
        {childName} 的身长/身高与体重
      </h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        按性别和月龄叠加 0-3 岁参考区间，用于家庭趋势观察；具体儿保结论仍以医生评估为准。
      </p>
    </div>
  );
}
