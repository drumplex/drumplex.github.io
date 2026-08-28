export const DIALOGUE_NODES = {
  PROCESSOR_INTRO: {
    speaker: "Processor Vane (Processing Dept)",
    text: "Variant VAR-9042-DELTA. Stand behind the yellow boundary marker. You are currently awaiting temporal adjudication.",
    options: [
      { text: "Where am I?", nextNode: "PROCESSOR_WHERE" },
      { text: "I demand to see a lawyer or representative.", nextNode: "PROCESSOR_LAWYER" },
      { text: "[Comply] Understood. I will wait.", nextNode: "PROCESSOR_COMPLY" }
    ]
  },
  PROCESSOR_WHERE: {
    speaker: "Processor Vane (Processing Dept)",
    text: "You are within the central node of the Chronarch Authority. Here, stray timeline forks are pruned to maintain causality purity.",
    options: [
      { text: "Who decided my timeline was a 'stray'?", nextNode: "PROCESSOR_ANGRY" },
      { text: "What happens to me now?", nextNode: "PROCESSOR_FUTURE" }
    ]
  },
  PROCESSOR_LAWYER: {
    speaker: "Processor Vane (Processing Dept)",
    text: "Legal representation is an unnecessary loop construct. Your timeline has already been marked for alignment.",
    options: [
      { text: "That sounds like murder.", nextNode: "PROCESSOR_ANGRY" },
      { text: "I understand.", nextNode: "PROCESSOR_COMPLY" }
    ]
  },
  PROCESSOR_COMPLY: {
    speaker: "Processor Vane (Processing Dept)",
    text: "Good. Your compliance score has been updated. Proceed down Corridor B to the Court Preparation Chamber.",
    options: [
      { text: "End Conversation", action: "CLOSE" }
    ]
  },
  PROCESSOR_ANGRY: {
    speaker: "Processor Vane (Processing Dept)",
    text: "Hostility detected. Alerting nearby security personnel for behavior calibration.",
    options: [
      { text: "End Conversation", action: "RAISE_ALERT_AND_CLOSE" }
    ]
  }
};
