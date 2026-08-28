import * as THREE from 'three';

export const AI_STATE = {
  PATROL: 'PATROL',
  SUSPICIOUS: 'SUSPICIOUS',
  INVESTIGATING: 'INVESTIGATING',
  ALERT: 'ALERT',
  SEARCHING: 'SEARCHING',
  CHASE: 'CHASE'
};

export class GuardAI {
  constructor(scene, startPosition, patrolWaypoints = []) {
    this.scene = scene;
    this.waypoints = patrolWaypoints;
    this.currentWaypointIndex = 0;

    // Physics / Transform Body
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xaa2222 });
    this.mesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.position.copy(startPosition);
    this.mesh.position.y = 0.9;
    
    // FOV Cone Representation
    const fovGeo = new THREE.ConeGeometry(6, 10, 16);
    fovGeo.rotateX(-Math.PI / 2);
    fovGeo.translate(0, 0, -5);
    const fovMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.15 });
    this.fovMesh = new THREE.Mesh(fovGeo, fovMat);
    this.mesh.add(this.fovMesh);

    this.scene.add(this.mesh);

    this.state = AI_STATE.PATROL;
    this.speed = 3.0;
    this.detectionProgress = 0.0; // 0 to 100
    this.lastKnownPlayerPos = new THREE.Vector3();
  }

  update(delta, playerPos, playerIsCrouching, onAlertCallback) {
    const distanceToPlayer = this.mesh.position.distanceTo(playerPos);
    
    // Check line of sight & field of view angle
    const dirToPlayer = new THREE.Vector3().subVectors(playerPos, this.mesh.position).normalize();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
    const angle = forward.angleTo(dirToPlayer);

    const fovAngle = Math.PI / 3; // 60 degrees total
    const maxVisionDist = playerIsCrouching ? 8.0 : 15.0;

    let canSeePlayer = false;
    if (angle < fovAngle / 2 && distanceToPlayer < maxVisionDist) {
      canSeePlayer = true;
    }

    // State Machine Processing
    switch (this.state) {
      case AI_STATE.PATROL:
        if (canSeePlayer) {
          this.detectionProgress += delta * 40;
          if (this.detectionProgress >= 50) this.state = AI_STATE.SUSPICIOUS;
          if (this.detectionProgress >= 100) {
            this.state = AI_STATE.CHASE;
            onAlertCallback();
          }
        } else {
          this.detectionProgress = Math.max(0, this.detectionProgress - delta * 20);
          this.patrol(delta);
        }
        break;

      case AI_STATE.SUSPICIOUS:
        this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
        if (canSeePlayer) {
          this.detectionProgress += delta * 60;
          if (this.detectionProgress >= 100) {
            this.state = AI_STATE.CHASE;
            onAlertCallback();
          }
        } else {
          this.detectionProgress -= delta * 30;
          if (this.detectionProgress <= 0) this.state = AI_STATE.PATROL;
        }
        break;

      case AI_STATE.CHASE:
        this.speed = 5.5;
        this.lastKnownPlayerPos.copy(playerPos);
        this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
        this.mesh.translateZ(this.speed * delta);

        if (!canSeePlayer && distanceToPlayer > 20.0) {
          this.state = AI_STATE.SEARCHING;
        }
        break;

      case AI_STATE.SEARCHING:
        this.speed = 2.5;
        this.mesh.lookAt(this.lastKnownPlayerPos.x, this.mesh.position.y, this.lastKnownPlayerPos.z);
        this.mesh.translateZ(this.speed * delta);
        if (this.mesh.position.distanceTo(this.lastKnownPlayerPos) < 1.0) {
          setTimeout(() => { this.state = AI_STATE.PATROL; }, 3000);
        }
        break;
    }
  }

  patrol(delta) {
    if (this.waypoints.length === 0) return;
    const target = this.waypoints[this.currentWaypointIndex];
    this.mesh.lookAt(target.x, this.mesh.position.y, target.z);
    this.mesh.translateZ(this.speed * delta);

    if (this.mesh.position.distanceTo(target) < 0.5) {
      this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
    }
  }
}
