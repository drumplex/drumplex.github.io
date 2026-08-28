export class UIManager {
  constructor() {
    this.deviationDisplay = document.getElementById('deviation-display');
    this.alertDisplay = document.getElementById('alert-level-display');
    this.promptDisplay = document.getElementById('interaction-prompt');
    this.objectiveDisplay = document.getElementById('objective-text');
    
    this.dialogueModal = document.getElementById('dialogue-modal');
    this.dialogueSpeaker = document.getElementById('dialogue-speaker');
    this.dialogueText = document.getElementById('dialogue-text');
    this.dialogueOptions = document.getElementById('dialogue-options');

    this.terminalModal = document.getElementById('terminal-modal');
    this.terminalContent = document.getElementById('terminal-content');
    
    document.getElementById('close-terminal-btn').addEventListener('click', () => {
      this.terminalModal.classList.add('hidden');
    });
  }

  updateHUD(deviationScore, alertText, objectiveText) {
    this.deviationDisplay.textContent = deviationScore;
    this.alertDisplay.textContent = alertText;
    if (objectiveText) this.objectiveDisplay.textContent = objectiveText;
  }

  showInteractionPrompt(text) {
    this.promptDisplay.textContent = text;
    this.promptDisplay.classList.remove('hidden');
  }

  hideInteractionPrompt() {
    this.promptDisplay.classList.add('hidden');
  }

  showDialogue(nodeData, onSelectOption) {
    this.dialogueSpeaker.textContent = nodeData.speaker;
    this.dialogueText.textContent = nodeData.text;
    this.dialogueOptions.innerHTML = '';

    nodeData.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => onSelectOption(opt));
      this.dialogueOptions.appendChild(btn);
    });

    this.dialogueModal.classList.remove('hidden');
  }

  hideDialogue() {
    this.dialogueModal.classList.add('hidden');
  }

  showTerminal(text) {
    this.terminalContent.innerHTML = `<p>${text}</p>`;
    this.terminalModal.classList.remove('hidden');
  }
}
