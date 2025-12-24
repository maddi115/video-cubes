import * as THREE from "three";

export function createGround() {
    const geometry = new THREE.PlaneGeometry(50,50);
    const material = new THREE.MeshStandardMaterial({
        color: 0x1e2a1e,      // darker green-brown
        emissive: 0x0a0a05,   // subtle emissive for night glow
        roughness: 0.9,
        metalness: 0
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    return ground;
}
