export class TemporalRod {
  constructor() {
    this.charge = 100;
    this.maxCharge = 100;
    this.isAcquired = false;
  }

  acquire() {
    this.isAcquired = true;
    this.charge = this.maxCharge;
  }

  use(targetObject) {
    if (!this.isAcquired || this.charge < 25) {
      return { success: false, message: "Insufficient Temporal Energy" };
    }

    this.charge -= 25;

    // Apply temporal freeze or pulse effect
    if (targetObject && targetObject.userData) {
      targetObject.userData.isTemporallyFrozen = true;
      setTimeout(() => {
        targetObject.userData.isTemporallyFrozen = false;
      }, 5000);
    }

    return {
      success: true,
      remainingCharge: this.charge,
      message: "Temporal Discharge Activated: Local Causality Suspended for 5s."
    };
  }
}
