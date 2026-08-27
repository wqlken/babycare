import { notFound } from "next/navigation";
import { SevenDaySummary } from "@/components/dashboard/seven-day-summary";
import { SummaryEmptyState } from "@/components/summary/summary-empty-state";
import { SummaryPageHeader } from "@/components/summary/summary-page-header";
import { SummaryRangeForm } from "@/components/summary/summary-range-form";
import { SummaryRangeMessage } from "@/components/summary/summary-range-message";
import { SummaryTotalCards } from "@/components/summary/summary-total-cards";
import { requireUser } from "@/lib/auth/guards";
import { getChildSummaryData } from "@/lib/dashboard";
import {
  buildSummaryRangeTotals,
  filterVisibleSummaries,
  normalizeSummaryDateRange,
} from "@/lib/summary-range";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{
    endDate?: string;
    includeEmpty?: string;
    startDate?: string;
  }>;
};

export default async function SummaryPage({ params, searchParams }: PageProps) {
  const user = await requireUser();
  const [{ childId }, query] = await Promise.all([params, searchParams]);
  const range = normalizeSummaryDateRange(query);
  const data = await getChildSummaryData(user.id, childId, {
    startDate: range.startDate,
    endDate: range.endDate,
  });

  if (!data) {
    notFound();
  }

  const totals = buildSummaryRangeTotals(data.summaries);
  const visibleSummaries = filterVisibleSummaries({
    includeEmpty: range.includeEmpty,
    summaries: data.summaries,
  });

  return (
    <section className="space-y-6">
      <SummaryPageHeader childName={data.child.name} />
      <SummaryRangeForm range={range} />
      <SummaryRangeMessage error={range.error} />
      <SummaryTotalCards totals={totals} />

      {visibleSummaries.length > 0 ? (
        <SevenDaySummary
          summaries={visibleSummaries}
          title={`${range.startDate} 至 ${range.endDate}`}
        />
      ) : (
        <SummaryEmptyState />
      )}
    </section>
  );
}
