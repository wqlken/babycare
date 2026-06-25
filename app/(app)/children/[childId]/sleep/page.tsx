import { SleepForm } from "@/components/forms/sleep-form";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function SleepPage({ params, searchParams }: PageProps) {
  const { childId } = await params;
  const query = await searchParams;

  return <SleepForm childId={childId} error={query?.error} />;
}
