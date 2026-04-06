/** Relationship dropdown — value + label */
export const RELATIONSHIPS = [
  { value: "direct_report", label: "Direct report" },
  { value: "peer", label: "Peer" },
  { value: "stakeholder", label: "Stakeholder" },
  { value: "leader", label: "Leader" },
] as const;

export type RelationshipValue = (typeof RELATIONSHIPS)[number]["value"];
