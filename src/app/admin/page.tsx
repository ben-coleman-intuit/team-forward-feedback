import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTeamConfig } from "@/lib/config";
import { logoutAction } from "./actions";

type Search = {
  subject?: string;
  from?: string;
  to?: string;
};

function formatIntuitValuesCell(v: unknown): string {
  if (Array.isArray(v)) {
    const strings = v.filter((x): x is string => typeof x === "string");
    return strings.join(" · ");
  }
  return "";
}

function formatIntuitValuesTitle(v: unknown): string {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string").join("; ");
  }
  return "";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const authed = await getAdminSession();
  if (!authed) {
    redirect("/admin/login");
  }

  const sp = await searchParams;
  const subject = sp.subject || undefined;
  const from = sp.from;
  const to = sp.to;

  const where: {
    subjectMemberId?: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};
  if (subject) where.subjectMemberId = subject;
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
    take: 200,
  });

  const { members } = getTeamConfig();

  const exportParams = new URLSearchParams();
  if (subject) exportParams.set("subject", subject);
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  const exportHref = `/api/admin/export?${exportParams.toString()}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Feedback submissions</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Showing up to 200 rows, newest first. Use filters and export for full data.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <a
              href={exportHref}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Download CSV
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
              >
                Sign out
              </button>
            </form>
            <Link
              href="/"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
            >
              Public form
            </Link>
          </div>
        </header>

        <form
          method="GET"
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="subject" className="text-xs font-medium text-zinc-500">
              Teammate
            </label>
            <select
              id="subject"
              name="subject"
              defaultValue={subject ?? ""}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 min-w-[200px]"
            >
              <option value="">All</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="from" className="text-xs font-medium text-zinc-500">
              From (UTC date)
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={from ?? ""}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="to" className="text-xs font-medium text-zinc-500">
              To (UTC date)
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={to ?? ""}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
          >
            Apply filters
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400">
              <tr>
                <th className="p-3 font-medium">When</th>
                <th className="p-3 font-medium">For</th>
                <th className="p-3 font-medium">From</th>
                <th className="p-3 font-medium">Relationship</th>
                <th className="p-3 font-medium">Intuit values</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    No rows match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                    <td className="p-3 whitespace-nowrap text-zinc-300">
                      {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="p-3">{r.subjectDisplayName}</td>
                    <td className="p-3">
                      <div>{r.submitterName}</div>
                      <div className="text-xs text-zinc-500">{r.submitterEmail}</div>
                    </td>
                    <td className="p-3 text-zinc-400">{r.relationship}</td>
                    <td className="p-3 max-w-md text-zinc-300" title={formatIntuitValuesTitle(r.intuitValues)}>
                      {formatIntuitValuesCell(r.intuitValues)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
