import {
  ActiveSleepNotice,
  SleepForm,
} from "@/components/forms/sleep-form";
import { requireUser } from "@/lib/auth/guards";
import { getAccessibleChild } from "@/lib/children/service";
import { getActiveSleep } from "@/lib/records/service";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function SleepPage({ params, searchParams }: PageProps) {
  const { childId } = await params;
  const query = await searchParams;
  const user = await requireUser();
  const child = await getAccessibleChild(user.id, childId);

  if (!child) {
    notFound();
  }

  const activeSleepResult = await getActiveSleep(user.id, { childId: child.id });
  const activeSleep =
    activeSleepResult.ok && activeSleepResult.activeSleep?.startTime
      ? activeSleepResult.activeSleep
      : null;

  if (activeSleep?.startTime) {
    return (
      <ActiveSleepNotice
        childId={child.id}
        childName={child.name}
        creatorDisplayName={activeSleep.creatorDisplayName}
        startTime={activeSleep.startTime}
      />
    );
  }

  return <SleepForm childId={child.id} childName={child.name} error={query?.error} />;
}
