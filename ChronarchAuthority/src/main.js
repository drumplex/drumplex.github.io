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
    this.container = document.getElementById('game-container');
    this.blocker = document.getElementById('instructions');
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 1. Scene & Renderer Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);
    this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.03);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 2. Core Game Subsystems
    this.deviationSystem = new TemporalDeviationSystem();
    this.temporalRod = new TemporalRod();
    this.courtSystem = new CourtSystem();
    this.audioEngine = new AudioEngine();
    this.inventorySystem = new InventorySystem();
    this.missionManager = new MissionManager();
    this.uiManager = new UIManager();
    this.dialogueManager = new DialogueManager(this.uiManager, this.deviationSystem);

    // 3. Player & Procedural Environment Initialization
    this.playerController = new PlayerController(this.camera, this.renderer.domElement);
    this.interactionSystem = new InteractionSystem(this.camera, this.scene);
    
    this.roomGenerator = new RoomGenerator(this.scene);
    this.roomGenerator.generateInitialLayout(6);

    // 4. Instantiate Guards
    this.guards = [
      new GuardAI(this.scene, new THREE.Vector3(0, 0, -20), [
        new THREE.Vector3(-4, 0, -20),
        new THREE.Vector3(4, 0, -20)
      ])
    ];

    // 5. Setup Input Event Listeners
    this.initControls();
    
    this.clock = new THREE.Clock();
    this.animate();
  }

  initControls() {
    this.blocker.addEventListener('click', () => {
      this.playerController.lock();
      document.getElementById('blocker').style.display = 'none';
      this.audioEngine.playProceduralHum();
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this.handleInteraction();
      }
      if (e.code === 'KeyF') {
        const result = this.temporalRod.use();
        console.log(result.message);
      }
      if (e.code === 'KeyK') {
        // Quick Save Test Hotkey
        SaveSystem.saveGame({
          deviationScore: this.deviationSystem.score,
          missionIndex: this.missionManager.currentMissionIndex
        });
      }
    });
  }

  handleInteraction() {
    this.interactionSystem.interact((userData) => {
      if (userData.type === 'DOCUMENT') {
        this.inventorySystem.addItem(userData);
        this.courtSystem.addEvidence(userData);
        this.deviationSystem.addDeviation(10, "Accessed Classified Material");
        this.uiManager.showTerminal(`Document Acquired: ${userData.name}\n\nWarning: Unclassified access detected on local logs.`);
      } else if (userData.type === 'TERMINAL') {
        this.dialogueManager.startDialogue('PROCESSOR_INTRO');
      } else if (userData.type === 'TEMPORAL_ROD') {
        this.temporalRod.acquire();
        this.deviationSystem.addDeviation(40, "Confiscated High-Level Temporal Rod");
        this.uiManager.showTerminal("TEMPORAL ROD ACQUIRED. Press [F] to discharge field stabilization.");
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    
    // Update player movement and collision against generated walls
    this.playerController.update(delta, this.roomGenerator.getColliders());

    // Update interaction raycaster checks
    const target = this.interactionSystem.update();
    if (target) {
      this.uiManager.showInteractionPrompt(`[E] ${target.userData.name || 'Interact'}`);
    } else {
      this.uiManager.hideInteractionPrompt();
    }

    // Update AI Guard logic
    const playerPos = this.playerController.getPosition();
    this.guards.forEach(guard => {
      guard.update(delta, playerPos, this.playerController.isCrouching, () => {
        this.deviationSystem.addDeviation(30, "Spotted by Patrol Security");
        this.audioEngine.playAlertSound();
      });
    });

    // Refresh HUD Data
    const currentMission = this.missionManager.getCurrentMission();
    this.uiManager.updateHUD(
      this.deviationSystem.score,
      this.deviationSystem.getAlertDescription(),
      currentMission ? currentMission.description : "No Active Directive"
    );

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new ChronarchGame();
});
