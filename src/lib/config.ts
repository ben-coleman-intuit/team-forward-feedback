import fs from "node:fs";
import path from "node:path";

export type SkillDef = { key: string; label: string };

export type TeamMember = {
  id: string;
  displayName: string;
  /** Career / role level shown under “Rate each skill” (e.g. Senior, Staff) */
  operatingLevel: string;
  skills: SkillDef[];
};

export type TeamConfig = {
  members: TeamMember[];
};

export type IntuitValuesConfig = {
  values: string[];
};

function readJson<T>(relativePath: string): T {
  const full = path.join(process.cwd(), relativePath);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw) as T;
}

export function getTeamConfig(): TeamConfig {
  const data = readJson<Record<string, unknown>>("config/team.json");
  const members = data.members as TeamMember[];
  if (!Array.isArray(members) || members.length === 0) {
    throw new Error("config/team.json must include a non-empty members array");
  }
  for (const m of members) {
    if (
      !m.id ||
      !m.displayName ||
      typeof m.operatingLevel !== "string" ||
      !m.operatingLevel.trim() ||
      !Array.isArray(m.skills) ||
      m.skills.length !== 5
    ) {
      throw new Error(
        `Invalid member ${m.id}: need displayName, operatingLevel, and exactly 5 skills`,
      );
    }
  }
  return { members };
}

export function getIntuitValues(): string[] {
  const data = readJson<IntuitValuesConfig & Record<string, unknown>>(
    "config/intuit-values.json",
  );
  const values = data.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("config/intuit-values.json must include a non-empty values array");
  }
  return values.filter((v) => typeof v === "string" && v.trim().length > 0);
}

export function getMemberById(id: string): TeamMember | undefined {
  return getTeamConfig().members.find((m) => m.id === id);
}
