import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: Request) {
  const authed = await getAdminSession();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const subject = url.searchParams.get("subject") || undefined;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: {
    subjectMemberId?: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  if (subject) {
    where.subjectMemberId = subject;
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) where.createdAt.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) where.createdAt.lte = d;
    }
  }

  const rows = await prisma.feedbackSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "id",
    "createdAt",
    "subjectMemberId",
    "subjectDisplayName",
    "submitterName",
    "submitterEmail",
    "relationship",
    "skillScoresJson",
    "intuitValuesJson",
    "narrativeBestWork",
    "narrativeAdvice",
    "narrativeOther",
    "submitterIp",
    "userAgent",
  ];

  const lines = [header.join(",")];
  for (const r of rows) {
    const skillJson = JSON.stringify(r.skillScores);
    const cells = [
      r.id,
      r.createdAt.toISOString(),
      r.subjectMemberId,
      r.subjectDisplayName,
      r.submitterName,
      r.submitterEmail,
      r.relationship,
      skillJson,
      JSON.stringify(r.intuitValues),
      r.narrativeBestWork,
      r.narrativeAdvice,
      r.narrativeOther,
      r.submitterIp ?? "",
      r.userAgent ?? "",
    ].map((c) => escapeCsvCell(String(c)));
    lines.push(cells.join(","));
  }

  const csv = lines.join("\r\n");
  const filename = `team-forward-feedback-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
