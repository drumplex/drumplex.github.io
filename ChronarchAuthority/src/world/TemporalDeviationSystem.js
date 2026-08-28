export class TemporalDeviationSystem {
  constructor() {
    this.score = 0;
    this.alertLevel = 0; // 0 to 6
  }

  addDeviation(points, reason = "") {
    this.score += points;
    console.log(`[DEVIATION +${points}] ${reason} | Total: ${this.score}`);
    this.updateAlertLevel();
    return this.score;
  }

  updateAlertLevel() {
    if (this.score < 15) this.alertLevel = 0;
    else if (this.score < 35) this.alertLevel = 1;
    else if (this.score < 60) this.alertLevel = 2;
    else if (this.score < 90) this.alertLevel = 3;
    else if (this.score < 130) this.alertLevel = 4;
    else if (this.score < 180) this.alertLevel = 5;
    else this.alertLevel = 6;
  }

  getAlertDescription() {
    const descriptions = [
      "LEVEL 0 (NORMAL)",
      "LEVEL 1 (SUSPICIOUS)",
      "LEVEL 2 (MONITORED)",
      "LEVEL 3 (FLAGGED)",
      "LEVEL 4 (WANTED)",
      "LEVEL 5 (MANHUNT)",
      "LEVEL 6 (TEMPORAL EMERGENCY)"
    ];
    return descriptions[this.alertLevel];
  }
}
