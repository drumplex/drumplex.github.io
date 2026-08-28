export class UIManager {
  constructor() {
    this.devDisplay = document.getElementById('deviation-display');
    this.alertDisplay = document.getElementById('alert-display');
    this.prompt = document.getElementById('interaction-prompt');

    this.dialogueModal = document.getElementById('dialogue-modal');
    this.speaker = document.getElementById('dialogue-speaker');
    this.text = document.getElementById('dialogue-text');
    this.options = document.getElementById('dialogue-options');

    this.terminalModal = document.getElementById('terminal-modal');
    this.terminalContent = document.getElementById('terminal-content');

    const closeBtn = document.getElementById('close-terminal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.terminalModal.classList.add('hidden');
      });
    }
  }

  updateHUD(score, alertText) {
    if (this.devDisplay) this.devDisplay.textContent = score;
    if (this.alertDisplay) this.alertDisplay.textContent = alertText;
  }

  showPrompt(text) {
    if (this.prompt) {
      this.prompt.textContent = text;
      this.prompt.classList.remove('hidden');
    }
  }

  hidePrompt() {
    if (this.prompt) {
      this.prompt.classList.add('hidden');
    }
  }

  showDialogue(node, onSelect) {
    if (!this.dialogueModal) return;
    this.speaker.textContent = node.speaker;
    this.text.textContent = node.text;
    this.options.innerHTML = '';

    node.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-btn';
      btn.textContent = opt.text;
      btn.onclick = () => onSelect(opt);
      this.options.appendChild(btn);
    });

    this.dialogueModal.classList.remove('hidden');
  }

  hideDialogue() {
    if (this.dialogueModal) {
      this.dialogueModal.classList.add('hidden');
    }
  }

  showTerminal(text) {
    if (this.terminalModal && this.terminalContent) {
      this.terminalContent.innerHTML = `<p>${text}</p>`;
      this.terminalModal.classList.remove('hidden');
    }
  }
}
