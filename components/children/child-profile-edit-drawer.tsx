"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateChildAction } from "@/app/actions/children";
import { AppDrawer } from "@/components/ui/app-drawer";

type ChildProfileEditDrawerProps = {
  child: {
    birthday: string;
    gender: string | null;
    id: string;
    name: string;
    notes: string | null;
  };
};

export function ChildProfileEditDrawer({ child }: ChildProfileEditDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="bc-focus-ring flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Pencil aria-hidden="true" size={18} />
        编辑资料
      </button>
      <AppDrawer
        description="更新宝宝姓名、生日、性别和备注。"
        onClose={() => setOpen(false)}
        open={open}
        title="编辑宝宝资料"
      >
        <form action={updateChildAction} className="space-y-4">
          <input name="childId" type="hidden" value={child.id} />
          <label className="block">
            <span className="bc-label">姓名</span>
            <input
              className="bc-input bc-focus-ring"
              defaultValue={child.name}
              name="name"
              required
            />
          </label>
          <label className="block">
            <span className="bc-label">生日</span>
            <input
              className="bc-input bc-focus-ring"
              defaultValue={child.birthday}
              name="birthday"
              required
              type="date"
            />
          </label>
          <label className="block">
            <span className="bc-label">性别</span>
            <select
              className="bc-input bc-focus-ring"
              defaultValue={child.gender ?? ""}
              name="gender"
            >
              <option value="">未填写</option>
              <option value="female">女</option>
              <option value="male">男</option>
            </select>
          </label>
          <label className="block">
            <span className="bc-label">备注</span>
            <textarea
              className="bc-input bc-focus-ring"
              defaultValue={child.notes ?? ""}
              name="notes"
              rows={3}
            />
          </label>
          <button className="bc-focus-ring min-h-12 w-full rounded-lg bg-[var(--primary)] px-4 text-base font-semibold text-white">
            保存资料
          </button>
        </form>
      </AppDrawer>
    </>
  );
}
