import * as THREE from 'three';
import { ROOM_DEFINITIONS, ROOM_TYPES } from '../data/RoomLibrary.js';

export class RoomGenerator {
  constructor(scene) {
    this.scene = scene;
    this.builtRooms = [];
    this.colliders = [];
    this.roomSeed = Math.random();
    
    // Default PBR Style Materials
    this.wallMaterial = new THREE.MeshStandardMaterial({ color: 0x222830, roughness: 0.8 });
    this.floorMaterial = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.4 });
    this.trimMaterial = new THREE.MeshStandardMaterial({ color: 0xc8963e, metalness: 0.6, roughness: 0.3 });
    this.lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffedd0 });
  }

  generateInitialLayout(count = 5) {
    let currentOrigin = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < count; i++) {
      const def = ROOM_DEFINITIONS[i % ROOM_DEFINITIONS.length];
      const roomMesh = this.buildRoom(def, currentOrigin);
      this.builtRooms.push({ def, mesh: roomMesh, origin: currentOrigin.clone() });
      
      // Shift origin along length to string rooms together
      currentOrigin.z -= def.length;
    }
  }

  buildRoom(def, origin) {
    const group = new THREE.Group();
    group.position.copy(origin);

    const w = def.width;
    const l = def.length;
    const h = def.height;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(w, l);
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Ceiling
    const ceil = new THREE.Mesh(floorGeo, this.wallMaterial);
    ceil.position.y = h;
    ceil.rotation.x = Math.PI / 2;
    group.add(ceil);

    // Left & Right Walls
    const sideWallGeo = new THREE.BoxGeometry(0.2, h, l);
    const leftWall = new THREE.Mesh(sideWallGeo, this.wallMaterial);
    leftWall.position.set(-w / 2, h / 2, 0);
    leftWall.geometry.computeBoundingBox();
    group.add(leftWall);
    this.colliders.push(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, this.wallMaterial);
    rightWall.position.set(w / 2, h / 2, 0);
    rightWall.geometry.computeBoundingBox();
    group.add(rightWall);
    this.colliders.push(rightWall);

    // Overhead Light Fixture
    const lightBoxGeo = new THREE.BoxGeometry(w * 0.4, 0.2, 2);
    const lightFixture = new THREE.Mesh(lightBoxGeo, this.lightMaterial);
    lightFixture.position.set(0, h - 0.1, 0);
    group.add(lightFixture);

    const pointLight = new THREE.PointLight(0xffedd0, 1.5, 20);
    pointLight.position.set(0, h - 1, 0);
    group.add(pointLight);

    // Construct Interactive Items inside Room
    if (def.items) {
      def.items.forEach(itemDef => {
        const itemMesh = this.createItemMesh(itemDef);
        itemMesh.position.set(...itemDef.pos);
        group.add(itemMesh);
      });
    }

    this.scene.add(group);
    return group;
  }

  createItemMesh(itemDef) {
    let geo;
    let mat = this.trimMaterial;

    if (itemDef.type === 'DOCUMENT') {
      geo = new THREE.BoxGeometry(0.4, 0.02, 0.6);
    } else if (itemDef.type === 'TERMINAL') {
      geo = new THREE.BoxGeometry(0.8, 0.6, 0.5);
    } else if (itemDef.type === 'TEMPORAL_ROD') {
      geo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12);
      mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    } else {
      geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = {
      isInteractive: true,
      id: itemDef.id,
      type: itemDef.type,
      name: itemDef.name
    };

    return mesh;
  }

  getColliders() {
    return this.colliders;
  }
}
