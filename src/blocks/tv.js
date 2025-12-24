import * as THREE from "three";
import { loadVideo } from '../assets/assets.js';

export function createTV(position, userInteracted) {
    const video = loadVideo('tv', '/video.mp4');
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const materials = [
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({
            map: texture,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: texture,
            emissiveIntensity:1.2
        }),
        new THREE.MeshStandardMaterial({color:0x000000})
    ];

    const geometry = new THREE.BoxGeometry(5,2,0.3);
    const tv = new THREE.Mesh(geometry, materials);
    tv.position.copy(position);
    tv.position.y = 1;

    if(userInteracted) video.play();
    return {mesh:tv, video};
}
