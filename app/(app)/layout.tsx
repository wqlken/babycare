import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth/guards";
import {
  getChildDashboardTarget,
  listAccessibleChildren,
} from "@/lib/children/service";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireUser();
  const target = await getChildDashboardTarget(user.id);

  if (target.kind === "needs-child") {
    redirect(target.href);
  }

  const childList = await listAccessibleChildren(user.id);

  return (
    <AppShell childList={childList} currentChildId={target.childId}>
      {children}
    </AppShell>
  );
}
