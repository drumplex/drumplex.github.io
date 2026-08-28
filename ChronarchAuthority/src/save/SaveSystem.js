export class SaveSystem {
  static SAVE_KEY = 'CHRONARCH_AUTHORITY_SAVE';

  static saveGame(stateData) {
    try {
      const serialized = JSON.stringify(stateData);
      localStorage.setItem(SaveSystem.SAVE_KEY, serialized);
      console.log("[SAVE SYSTEM] Game saved successfully.");
      return true;
    } catch (err) {
      console.error("[SAVE SYSTEM] Failed to save game:", err);
      return false;
    }
  }

  static loadGame() {
    try {
      const data = localStorage.getItem(SaveSystem.SAVE_KEY);
      if (!data) return null;
      console.log("[SAVE SYSTEM] Game state loaded.");
      return JSON.parse(data);
    } catch (err) {
      console.error("[SAVE SYSTEM] Failed to load save file:", err);
      return null;
    }
  }
}
