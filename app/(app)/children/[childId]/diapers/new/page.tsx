import { DiaperForm } from "@/components/forms/diaper-form";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewDiaperPage({
  params,
  searchParams,
}: PageProps) {
  const { childId } = await params;
  const query = await searchParams;

  return <DiaperForm childId={childId} error={query?.error} />;
}
