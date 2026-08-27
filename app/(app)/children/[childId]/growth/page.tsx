import { notFound } from "next/navigation";
import { GrowthCharts } from "@/components/growth/growth-charts";
import { GrowthPageHeader } from "@/components/growth/growth-page-header";
import { GrowthPageMessages } from "@/components/growth/growth-page-messages";
import { GrowthRecentList } from "@/components/growth/growth-recent-list";
import { GrowthRecordForm } from "@/components/growth/growth-record-form";
import { GrowthReferencePanel } from "@/components/growth/growth-reference-panel";
import { GrowthSummaryCards } from "@/components/growth/growth-summary-cards";
import { requireUser } from "@/lib/auth/guards";
import { getGrowthData } from "@/lib/growth/service";
import { buildGrowthPageViewModel } from "@/lib/growth/view-model";

type GrowthPageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function GrowthPage({
  params,
  searchParams,
}: GrowthPageProps) {
  const user = await requireUser();
  const [{ childId }, query] = await Promise.all([params, searchParams]);
  const data = await getGrowthData(user.id, childId);

  if (!data.ok) {
    notFound();
  }

  const view = buildGrowthPageViewModel(data);

  return (
    <section className="space-y-6">
      <GrowthPageHeader childName={data.child.name} />
      <GrowthPageMessages error={query?.error} saved={query?.saved} />
      <GrowthSummaryCards
        latestBmiRecord={view.latestBmiRecord}
        latestLength={data.latestLength}
        latestWeight={data.latestWeight}
        recordCount={data.records.length}
      />
      <GrowthReferencePanel
        hasReferenceSex={Boolean(view.sex)}
        lengthAssessment={view.lengthAssessment}
        weightAssessment={view.weightAssessment}
      />

      <GrowthRecordForm childId={data.child.id} childName={data.child.name} />

      <GrowthCharts
        lengthChart={view.lengthChart}
        maxAgeDays={view.maxAgeDays}
        weightChart={view.weightChart}
      />
      <GrowthRecentList records={view.recentRecords} />
    </section>
  );
}
