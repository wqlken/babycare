import { DiaperForm } from "@/components/forms/diaper-form";
import { requireUser } from "@/lib/auth/guards";
import { getAccessibleChild } from "@/lib/children/service";
import { notFound } from "next/navigation";

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
  const user = await requireUser();
  const child = await getAccessibleChild(user.id, childId);

  if (!child) {
    notFound();
  }

  return (
    <DiaperForm childId={child.id} childName={child.name} error={query?.error} />
  );
}
