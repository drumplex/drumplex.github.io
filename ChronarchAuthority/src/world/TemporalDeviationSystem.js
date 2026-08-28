export class TemporalDeviationSystem {
  constructor() {
    this.score = 0;
  }

  addDeviation(amount) {
    this.score += amount;
  }

  getAlertLevel() {
    if (this.score < 25) {
      return "LEVEL 0 (NORMAL)";
    } else if (this.score < 50) {
      return "LEVEL 1 (ELEVATED)";
    } else if (this.score < 75) {
      return "LEVEL 2 (HIGH)";
    } else {
      return "LEVEL 3 (CRITICAL)";
    }
  }
}
