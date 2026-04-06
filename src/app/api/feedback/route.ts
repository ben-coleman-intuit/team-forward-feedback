import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getIntuitValues, getMemberById } from "@/lib/config";
import { parseFeedbackBody } from "@/lib/validation";
import { sendFeedbackConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subjectMemberId =
    typeof body === "object" &&
    body !== null &&
    "subjectMemberId" in body &&
    typeof (body as { subjectMemberId: unknown }).subjectMemberId === "string"
      ? (body as { subjectMemberId: string }).subjectMemberId
      : "";

  const member = getMemberById(subjectMemberId);
  if (!member) {
    return NextResponse.json(
      { error: "Unknown team member" },
      { status: 400 },
    );
  }

  let payload;
  try {
    payload = parseFeedbackBody(body, member, getIntuitValues());
  } catch (e) {
    const message = e instanceof Error ? e.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const skillScoresJson = member.skills.map((s) => ({
    skillKey: s.key,
    skillLabel: s.label,
    score: payload.skillScores[s.key]!,
  }));

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const submitterIp =
    forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent") || null;

  const row = await prisma.feedbackSubmission.create({
    data: {
      subjectMemberId: member.id,
      subjectDisplayName: member.displayName,
      submitterName: payload.submitterName,
      submitterEmail: payload.submitterEmail,
      relationship: payload.relationship,
      skillScores: skillScoresJson,
      intuitValues: payload.intuitValues,
      narrativeBestWork: payload.narrativeBestWork,
      narrativeAdvice: payload.narrativeAdvice,
      narrativeOther: payload.narrativeOther,
      submitterIp,
      userAgent,
    },
  });

  await sendFeedbackConfirmation({
    to: payload.submitterEmail,
    subjectDisplayName: member.displayName,
    submissionId: row.id,
  });

  return NextResponse.json({ ok: true, id: row.id });
}
