export const MISSIONS = [
  {
    id: "M1_REPORT_TO_PROCESSING",
    title: "Initial Processing",
    description: "Report to Processor Vane in Station 4 for identity verification.",
    completed: false,
    nextMission: "M2_ATTEND_HEARING"
  },
  {
    id: "M2_ATTEND_HEARING",
    title: "Court Adjudication",
    description: "Navigate through security to the Temporal Court for your timeline hearing.",
    completed: false,
    nextMission: "M3_INVESTIGATE_ARCHIVES"
  },
  {
    id: "M3_INVESTIGATE_ARCHIVES",
    title: "Unseen Truths",
    description: "Locate restricted Archive Room 09 and access the forbidden Chronos Ledger.",
    completed: false,
    nextMission: null
  }
];
