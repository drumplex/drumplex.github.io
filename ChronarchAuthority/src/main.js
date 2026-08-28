import * as THREE from 'three';
import { PlayerController } from './player/PlayerController.js';
import { InteractionSystem } from './player/InteractionSystem.js';
import { RoomGenerator } from './procedural/RoomGenerator.js';
import { GuardAI } from './ai/GuardAI.js';
import { TemporalDeviationSystem } from './world/TemporalDeviationSystem.js';
import { TemporalRod } from './world/TemporalRod.js';
import { UIManager } from './ui/UIManager.js';
import { DIALOGUE_NODES } from './data/DialogueData.js';

class ChronarchGame {
  constructor() {
    // 1. Scene MUST be created first
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);

    // 2. Camera & Renderer setup
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(this.renderer.domElement);

    // 3. Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 4. Systems
    this.ui = new UIManager();
    this.deviation = new TemporalDeviationSystem();
    this.rod = new TemporalRod();

    this.player = new PlayerController(this.camera, this.renderer.domElement);
    this.interaction = new InteractionSystem(this.camera, this.scene);

    // 5. World Generation
    this.generator = new RoomGenerator(this.scene);
    this.generator.generateInitialLayout(5);

    this.guards = [
      new GuardAI(this.scene, new THREE.Vector3(0, 0, -15), [
        new THREE.Vector3(-3, 0, -15),
        new THREE.Vector3(3, 0, -15)
      ])
    ];

    this.clock = new THREE.Clock();

    document.getElementById('blocker').addEventListener('click', () => {
      this.player.lock();
      document.getElementById('blocker').classList.add('hidden');
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') this.handleInteract();
      if (e.code === 'KeyF') alert(this.rod.use());
    });

    this.animate();
  }

  handleInteract() {
    this.interaction.interact((data) => {
      if (data.type === 'DOCUMENT') {
        this.deviation.addDeviation(15);
        this.ui.showTerminal(`Accessing File: ${data.name}`);
      } else if (data.type === 'TERMINAL') {
        this.ui.showDialogue(DIALOGUE_NODES.START, (opt) => {
          if (opt.nextNode && DIALOGUE_NODES[opt.nextNode]) {
            this.ui.showDialogue(DIALOGUE_NODES[opt.nextNode], () => this.ui.hideDialogue());
          } else {
            this.ui.hideDialogue();
          }
        });
      } else if (data.type === 'TEMPORAL_ROD') {
        this.rod.acquire();
        this.deviation.addDeviation(30);
        this.ui.showTerminal("TEMPORAL ROD ACQUIRED. Press [F] to use.");
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    this.player.update(delta, this.generator.getColliders());
    
    const target = this.interaction.update();
    if (target) this.ui.showPrompt(`[E] ${target.userData.name}`);
    else this.ui.hidePrompt();

    const playerPos = this.player.getPosition();
    this.guards.forEach(g => g.update(delta, playerPos, () => {
      this.deviation.addDeviation(1);
    }));

    this.ui.updateHUD(this.deviation.score, this.deviation.getAlertLevel());

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => new ChronarchGame());
