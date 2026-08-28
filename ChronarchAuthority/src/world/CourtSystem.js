export class CourtSystem {
  constructor() {
    this.evidenceCollected = [];
    this.verdict = null;
  }

  addEvidence(evidenceItem) {
    this.evidenceCollected.push(evidenceItem);
  }

  evaluateVerdict(deviationScore) {
    const hasClassifiedProof = this.evidenceCollected.some(e => e.id === 'file_01');

    if (hasClassifiedProof && deviationScore < 50) {
      this.verdict = "COURT_VICTORY_FULL_EXONERATION";
    } else if (deviationScore > 100) {
      this.verdict = "TIMELINE_CORRECTION_PRUNING";
    } else {
      this.verdict = "REASSIGNED_TO_PERPETUAL_LABOR";
    }

    return this.verdict;
  }
}
