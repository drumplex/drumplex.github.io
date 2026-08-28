import * as THREE from 'three';

export class InteractionSystem {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 3.5; // Max interaction distance
    this.currentTarget = null;
  }

  update() {
    // Cast ray from center of screen
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let foundInteractive = null;

    for (const hit of intersects) {
      let obj = hit.object;
      while (obj && obj !== this.scene) {
        if (obj.userData && obj.userData.isInteractive) {
          foundInteractive = obj;
          break;
        }
        obj = obj.parent;
      }
      if (foundInteractive) break;
    }

    this.currentTarget = foundInteractive;
    return this.currentTarget;
  }

  interact(onTriggerCallback) {
    if (this.currentTarget && onTriggerCallback) {
      onTriggerCallback(this.currentTarget.userData);
    }
  }
}
