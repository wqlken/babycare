"use client";

import { Baby, Droplets } from "lucide-react";
import { useState } from "react";

type DiaperType = "wet" | "dirty" | "both";

const options: Array<{ value: DiaperType; label: string }> = [
  { value: "wet", label: "尿湿" },
  { value: "dirty", label: "便便" },
  { value: "both", label: "都有" },
];

export function DiaperTypeFields() {
  const [type, setType] = useState<DiaperType>("wet");
  const showStoolFields = type === "dirty" || type === "both";

  return (
    <fieldset className="space-y-4">
      <legend className="bc-label">类型</legend>
      <input name="type" type="hidden" value={type} />
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const active = type === option.value;

          return (
            <button
              aria-pressed={active}
              className={`bc-focus-ring flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                active
                  ? "border-[var(--accent-diaper-strong)] bg-[var(--accent-diaper-soft)] text-[var(--foreground)]"
                  : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-muted)]"
              }`}
              key={option.value}
              onClick={() => setType(option.value)}
              type="button"
            >
              {option.value === "wet" ? (
                <Droplets aria-hidden="true" size={20} />
              ) : (
                <Baby aria-hidden="true" size={20} />
              )}
              {option.label}
            </button>
          );
        })}
      </div>

      {showStoolFields ? (
        <div className="space-y-4">
          <label className="block">
            <span className="bc-label">便便颜色</span>
            <select
              className="bc-input bc-focus-ring"
              defaultValue=""
              name="stoolColor"
            >
              <option value="">未指定</option>
              <option value="yellow">黄色</option>
              <option value="brown">棕色</option>
              <option value="green">绿色</option>
              <option value="black">黑色</option>
              <option value="red">红色</option>
              <option value="white">白色</option>
              <option value="other">其他</option>
            </select>
          </label>
          <label className="block">
            <span className="bc-label">便便性状</span>
            <select
              className="bc-input bc-focus-ring"
              defaultValue=""
              name="stoolConsistency"
            >
              <option value="">未指定</option>
              <option value="watery">水样</option>
              <option value="loose">稀软</option>
              <option value="soft">软便</option>
              <option value="formed">成形</option>
              <option value="hard">偏硬</option>
              <option value="mucousy">黏液</option>
              <option value="other">其他</option>
            </select>
          </label>
        </div>
      ) : null}
    </fieldset>
  );
}
