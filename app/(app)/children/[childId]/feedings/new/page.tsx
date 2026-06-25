import { FeedingForm } from "@/components/forms/feeding-form";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewFeedingPage({
  params,
  searchParams,
}: PageProps) {
  const { childId } = await params;
  const query = await searchParams;

  return <FeedingForm childId={childId} error={query?.error} />;
}
