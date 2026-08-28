import { MISSIONS } from '../data/MissionsData.js';

export class MissionManager {
  constructor() {
    this.missions = MISSIONS;
    this.currentMissionIndex = 0;
  }

  getCurrentMission() {
    return this.missions[this.currentMissionIndex];
  }

  completeCurrentMission() {
    if (this.currentMissionIndex < this.missions.length) {
      this.missions[this.currentMissionIndex].completed = true;
      this.currentMissionIndex++;
      return this.getCurrentMission();
    }
    return null;
  }
}
