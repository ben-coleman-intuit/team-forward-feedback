"use client";

import { useEffect, useMemo, useState } from "react";
import type { TeamMember } from "@/lib/config";

type RelationshipOption = { value: string; label: string };

type Props = {
  members: TeamMember[];
  intuitValues: string[];
  relationships: RelationshipOption[];
};

export function FeedbackForm({ members, intuitValues, relationships }: Props) {
  const [subjectId, setSubjectId] = useState(members[0]?.id ?? "");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [relationship, setRelationship] = useState(relationships[0]?.value ?? "");
  const [skillScores, setSkillScores] = useState<Record<string, number>>(() => {
    const m = members[0];
    if (!m) return {};
    const o: Record<string, number> = {};
    for (const s of m.skills) o[s.key] = 5;
    return o;
  });
  const [selectedIntuitValues, setSelectedIntuitValues] = useState<string[]>([]);
  const [narrativeBestWork, setNarrativeBestWork] = useState("");
  const [narrativeAdvice, setNarrativeAdvice] = useState("");
  const [narrativeOther, setNarrativeOther] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subject = useMemo(
    () => members.find((m) => m.id === subjectId),
    [members, subjectId],
  );

  const subjectFirstName = useMemo(() => {
    if (!subject) return "them";
    const first = subject.displayName.trim().split(/\s+/)[0];
    return first || "them";
  }, [subject]);

  useEffect(() => {
    if (!subject) return;
    const next: Record<string, number> = {};
    for (const s of subject.skills) {
      next[s.key] = 5;
    }
    setSkillScores(next);
  }, [subject]);

  function setScore(key: string, v: number) {
    setSkillScores((prev) => ({ ...prev, [key]: v }));
  }

  function toggleIntuitValue(value: string) {
    setSelectedIntuitValues((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject) return;
    setStatus("submitting");
    setErrorMessage(null);

    if (selectedIntuitValues.length === 0) {
      setErrorMessage("Select at least one Intuit value.");
      setStatus("error");
      return;
    }

    const body = {
      subjectMemberId: subject.id,
      submitterName,
      submitterEmail,
      relationship,
      skillScores,
      intuitValues: [...selectedIntuitValues].sort((a, b) => a.localeCompare(b)),
      narrativeBestWork,
      narrativeAdvice,
      narrativeOther,
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMessage("Network error — try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-8 text-center"
        role="status"
      >
        <h2 className="text-xl font-semibold text-emerald-200">Thank you</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Your feedback was submitted. Check your email for a short confirmation.
        </p>
      </div>
    );
  }

  if (!subject) {
    return (
      <p className="text-red-400">
        No team members configured. Edit <code className="text-xs">config/team.json</code>.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8 max-w-2xl">
      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="text-sm font-medium text-zinc-400 mb-1">
          Start by selecting who you are sharing feedback for:
        </legend>
        <label htmlFor="subject" className="sr-only">
          Teammate
        </label>
        <select
          id="subject"
          name="subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="submitterName" className="text-sm font-medium text-zinc-400">
            Your name
          </label>
          <input
            id="submitterName"
            name="submitterName"
            type="text"
            autoComplete="name"
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
            maxLength={200}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="submitterEmail" className="text-sm font-medium text-zinc-400">
            Your email
          </label>
          <input
            id="submitterEmail"
            name="submitterEmail"
            type="email"
            autoComplete="email"
            value={submitterEmail}
            onChange={(e) => setSubmitterEmail(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
            maxLength={320}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="relationship" className="text-sm font-medium text-zinc-400">
          Relationship to {subjectFirstName}
        </label>
        <select
          id="relationship"
          name="relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        >
          {relationships.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="rounded-xl border border-zinc-800 p-4 flex flex-col gap-4">
        <legend className="px-1 text-sm font-medium text-zinc-300">
          Rate each skill (1 = low, 10 = high)
        </legend>
        <p className="text-sm text-zinc-400 -mt-1 mb-1 px-1 leading-relaxed">
          {subjectFirstName} is aiming to operate at {subject.operatingLevel} level
        </p>
        {subject.skills.map((s, i) => (
          <div key={s.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor={`skill-${s.key}`} className="text-sm text-zinc-300 sm:max-w-[55%]">
              {i + 1}. {s.label}
            </label>
            <input
              id={`skill-${s.key}`}
              name={`skill_${s.key}`}
              type="range"
              min={1}
              max={10}
              step={1}
              value={skillScores[s.key] ?? 5}
              onChange={(e) => setScore(s.key, Number(e.target.value))}
              className="w-full sm:w-48 accent-sky-500"
            />
            <span className="text-sm tabular-nums text-zinc-400 w-8 text-right">
              {skillScores[s.key] ?? 5}
            </span>
          </div>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-zinc-800 p-4">
        <legend className="px-1 text-sm font-medium text-zinc-400">
          Select the Intuit values that {subjectFirstName} most often demonstrates
        </legend>
        <ul className="flex flex-col gap-2 list-none m-0 p-0">
          {intuitValues.map((v, i) => {
            const inputId = `intuit-value-${i}`;
            return (
              <li key={`${i}-${v}`} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={inputId}
                  checked={selectedIntuitValues.includes(v)}
                  onChange={() => toggleIntuitValue(v)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border border-zinc-600 bg-zinc-900 accent-sky-500"
                />
                <label htmlFor={inputId} className="text-sm text-zinc-200 cursor-pointer leading-snug">
                  {v}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="narrativeBestWork" className="text-sm font-medium text-zinc-400">
          Best work this year — what made it awesome and the impact
        </label>
        <textarea
          id="narrativeBestWork"
          name="narrativeBestWork"
          rows={5}
          value={narrativeBestWork}
          onChange={(e) => setNarrativeBestWork(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="narrativeAdvice" className="text-sm font-medium text-zinc-400">
          Career growth advice for greater impact
        </label>
        <textarea
          id="narrativeAdvice"
          name="narrativeAdvice"
          rows={5}
          value={narrativeAdvice}
          onChange={(e) => setNarrativeAdvice(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="narrativeOther" className="text-sm font-medium text-zinc-400">
          Any other feedback
        </label>
        <textarea
          id="narrativeOther"
          name="narrativeOther"
          rows={4}
          value={narrativeOther}
          onChange={(e) => setNarrativeOther(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-lg bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Submit feedback"}
      </button>
    </form>
  );
}
