import * as THREE from "three";
import { loadVideo } from '../assets/assets.js';

export function createCube(position, userInteracted) {
    const video = loadVideo('cube', '/video.mp4');
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: texture,
        emissiveIntensity:1.2
    });

    const geometry = new THREE.BoxGeometry(1,1,1);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);

    if(userInteracted) video.play();
    return {mesh:cube, video};
}
