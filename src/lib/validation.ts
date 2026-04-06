import { z } from "zod";
import type { TeamMember } from "@/lib/config";

const baseWithoutIntuit = z.object({
  subjectMemberId: z.string().min(1),
  submitterName: z.string().min(1).max(200),
  submitterEmail: z.string().email().max(320),
  relationship: z.enum(["direct_report", "peer", "stakeholder", "leader"]),
  narrativeBestWork: z.string().min(1).max(50_000),
  narrativeAdvice: z.string().min(1).max(50_000),
  narrativeOther: z.string().min(1).max(50_000),
});

export type FeedbackPayload = z.infer<typeof baseWithoutIntuit> & {
  skillScores: Record<string, number>;
  intuitValues: string[];
};

export function parseFeedbackBody(
  raw: unknown,
  member: TeamMember,
  allowedIntuitValues: string[],
): FeedbackPayload {
  const skillKeys = member.skills.map((s) => s.key);
  const allowed = new Set(allowedIntuitValues);

  const schema = baseWithoutIntuit.extend({
    skillScores: z
      .record(z.string(), z.number().int().min(1).max(10))
      .superRefine((val, ctx) => {
        const got = new Set(Object.keys(val));
        const need = new Set(skillKeys);
        if (got.size !== need.size || [...need].some((k) => !got.has(k))) {
          ctx.addIssue({
            code: "custom",
            message:
              "Provide exactly one score (1–10) for each skill listed for this teammate",
          });
        }
      }),
    intuitValues: z
      .array(z.string().max(500))
      .min(1, "Select at least one Intuit value")
      .superRefine((arr, ctx) => {
        const seen = new Set<string>();
        for (const v of arr) {
          if (!allowed.has(v)) {
            ctx.addIssue({
              code: "custom",
              message: "One or more selected values are not valid",
            });
            return;
          }
          if (seen.has(v)) {
            ctx.addIssue({
              code: "custom",
              message: "Duplicate Intuit values are not allowed",
            });
            return;
          }
          seen.add(v);
        }
      }),
  });

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(msg || "Invalid request");
  }

  return parsed.data;
}
