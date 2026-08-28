import * as THREE from 'three';

export class PlayerController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.isLocked = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.isCrouching = false;
    this.isRunning = false;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.standingHeight = 1.7;
    this.crouchHeight = 0.9;
    
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.camera.position.y = this.standingHeight;

    this.initListeners();
  }

  initListeners() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  lock() {
    this.domElement.requestPointerLock();
    this.isLocked = true;
  }

  unlock() {
    document.exitPointerLock();
    this.isLocked = false;
  }

  onMouseMove(event) {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;
    this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW': this.moveForward = true; break;
      case 'KeyS': this.moveBackward = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyD': this.moveRight = true; break;
      case 'Space': 
        if (this.canJump) {
          this.velocity.y += 8.0;
          this.canJump = false;
        }
        break;
      case 'ControlLeft':
      case 'KeyC':
        this.isCrouching = true;
        break;
      case 'ShiftLeft':
        this.isRunning = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW': this.moveForward = false; break;
      case 'KeyS': this.moveBackward = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyD': this.moveRight = false; break;
      case 'ControlLeft':
      case 'KeyC':
        this.isCrouching = false;
        break;
      case 'ShiftLeft':
        this.isRunning = false;
        break;
    }
  }

  update(delta, colliders = []) {
    if (!this.isLocked) return;

    // Smooth crouch camera height transition
    const targetHeight = this.isCrouching ? this.crouchHeight : this.standingHeight;
    this.camera.position.y += (targetHeight - this.camera.position.y) * delta * 10;

    // Friction & Gravity
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= 9.8 * 2.5 * delta; // Gravity

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    let speed = 12.0;
    if (this.isCrouching) speed = 5.0;
    if (this.isRunning && !this.isCrouching) speed = 22.0;

    if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * speed * 10.0 * delta;
    if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * speed * 10.0 * delta;

    // Translate relative to camera orientation
    const oldPosition = this.camera.position.clone();
    
    this.camera.moveRight(-this.velocity.x * delta);
    this.camera.moveForward(-this.velocity.z * delta);
    this.camera.position.y += this.velocity.y * delta;

    // Basic Floor Collision
    if (this.camera.position.y < targetHeight) {
      this.velocity.y = 0;
      this.camera.position.y = targetHeight;
      this.canJump = true;
    }

    // AABB Bounding Box Wall Collision Check
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      this.camera.position,
      new THREE.Vector3(0.8, targetHeight, 0.8)
    );

    for (const obj of colliders) {
      if (obj.isMesh && obj.geometry.boundingBox) {
        const wallBox = new THREE.Box3().setFromObject(obj);
        if (playerBox.intersectsBox(wallBox)) {
          // Revert movement on collision XZ plane
          this.camera.position.x = oldPosition.x;
          this.camera.position.z = oldPosition.z;
          break;
        }
      }
    }
  }

  getPosition() {
    return this.camera.position;
  }
}
