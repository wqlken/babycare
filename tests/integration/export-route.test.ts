import { describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "owner-1" })),
}));

vi.mock("@/lib/exports/service", () => ({
  buildOwnerExportCsv: vi.fn(async () => ({
    ok: true,
    csv: "kind,recordId\r\nfeeding,feeding-1",
    filename: "babycare-Baby-2026-06-25-2026-06-25.csv",
  })),
}));

describe("export route", () => {
  test("returns CSV attachment for authenticated owners", async () => {
    const { buildOwnerExportCsv } = await import("@/lib/exports/service");
    const { GET } = await import("@/app/api/export/[childId]/route");
    const request = new NextRequest(
      "http://localhost:3000/api/export/child-1?from=2026-06-25&to=2026-06-25",
    );

    const response = await GET(request, {
      params: Promise.resolve({ childId: "child-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="babycare-Baby-2026-06-25-2026-06-25.csv"',
    );
    expect(await response.text()).toBe("kind,recordId\r\nfeeding,feeding-1");
    expect(buildOwnerExportCsv).toHaveBeenCalledWith("owner-1", {
      childId: "child-1",
      from: "2026-06-25",
      to: "2026-06-25",
      timezone: "Asia/Shanghai",
    });
  });
});
