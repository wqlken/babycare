import {
  createInviteAction,
  resetCaregiverPasswordAction,
  removeFamilyMemberAction,
  updateFamilyMemberRoleAction,
} from "@/app/actions/family";
import { requireUser } from "@/lib/auth/guards";
import { listFamilyMembers } from "@/lib/family/service";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    invite?: string;
    saved?: string;
    temporaryPassword?: string;
  }>;
};

export default async function FamilySettingsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const [members, query] = await Promise.all([
    listFamilyMembers(user.id),
    searchParams,
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">家庭成员</h1>
        <p className="mt-1 text-sm text-slate-500">
          Owner 可以生成邀请链接，手动发给家人或照护者。
        </p>
      </div>
      {query?.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}
      {query?.invite ? (
        <div className="rounded border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-medium text-sky-900">邀请链接</p>
          <p className="mt-2 break-all text-sm text-sky-950">{query.invite}</p>
        </div>
      ) : null}
      {query?.saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          已更新家庭成员。
        </p>
      ) : null}
      {query?.temporaryPassword ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">临时密码</p>
          <p className="mt-2 font-mono text-sm text-amber-950">
            {query.temporaryPassword}
          </p>
        </div>
      ) : null}
      <form action={createInviteAction} className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">邀请邮箱</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="email"
            type="email"
            required
          />
        </label>
        <button className="rounded bg-slate-950 px-4 py-2 font-medium text-white">
          生成邀请
        </button>
      </form>
      <div className="space-y-3">
        {members.map((member) => (
          <article
            className="rounded border border-slate-200 bg-white p-4"
            key={member.id}
          >
            <p className="font-medium text-slate-950">{member.user.displayName}</p>
            <p className="text-sm text-slate-500">{member.user.email}</p>
            <p className="mt-1 text-sm text-slate-700">{member.role}</p>
            {member.userId !== user.id ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={updateFamilyMemberRoleAction}>
                  <input name="memberId" type="hidden" value={member.id} />
                  <input
                    name="role"
                    type="hidden"
                    value={member.role === "owner" ? "caregiver" : "owner"}
                  />
                  <button className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700">
                    {member.role === "owner" ? "降为照护者" : "设为 Owner"}
                  </button>
                </form>
                {member.role === "caregiver" ? (
                  <form action={resetCaregiverPasswordAction}>
                    <input name="memberId" type="hidden" value={member.id} />
                    <button className="rounded border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700">
                      重置临时密码
                    </button>
                  </form>
                ) : null}
              </div>
            ) : null}
            {member.userId !== user.id ? (
              <form action={removeFamilyMemberAction} className="mt-3">
                <input name="memberId" type="hidden" value={member.id} />
                <button className="rounded border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700">
                  移除成员
                </button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
