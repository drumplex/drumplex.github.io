import { DIALOGUE_NODES } from '../data/DialogueData.js';

export class DialogueManager {
  constructor(uiManager, deviationSystem) {
    this.uiManager = uiManager;
    this.deviationSystem = deviationSystem;
    this.currentNode = null;
  }

  startDialogue(nodeKey) {
    this.currentNode = DIALOGUE_NODES[nodeKey];
    if (!this.currentNode) return;

    this.uiManager.showDialogue(this.currentNode, (selectedOption) => {
      this.handleOption(selectedOption);
    });
  }

  handleOption(option) {
    if (option.action === 'CLOSE') {
      this.uiManager.hideDialogue();
    } else if (option.action === 'RAISE_ALERT_AND_CLOSE') {
      this.deviationSystem.addDeviation(15, "Hostile response to Chronarch Personnel");
      this.uiManager.hideDialogue();
    } else if (option.nextNode) {
      this.startDialogue(option.nextNode);
    }
  }
}
