import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildOwnerExportCsv } from "@/lib/exports/service";

type RouteContext = {
  params: Promise<{ childId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    );
  }

  const { childId } = await context.params;
  const from = request.nextUrl.searchParams.get("from") ?? "";
  const to = request.nextUrl.searchParams.get("to") ?? from;
  const timezone =
    request.nextUrl.searchParams.get("timezone") ?? "Asia/Shanghai";

  const result = await buildOwnerExportCsv(user.id, {
    childId,
    from,
    to,
    timezone,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(result.csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${result.filename}"`,
    },
  });
}
