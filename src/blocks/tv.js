import * as THREE from "three";

// Shared video element and texture
const sharedVideo = document.createElement('video');
sharedVideo.src = '/video.mp4';
sharedVideo.crossOrigin = "anonymous";
sharedVideo.loop = true;
sharedVideo.muted = true;
sharedVideo.playsInline = true;
sharedVideo.autoplay = false;

const sharedTexture = new THREE.VideoTexture(sharedVideo);
sharedTexture.colorSpace = THREE.SRGBColorSpace;
sharedTexture.minFilter = THREE.LinearFilter;
sharedTexture.magFilter = THREE.LinearFilter;
sharedTexture.format = THREE.RGBFormat;

export function createTV(position, userInteracted, width=5, height=2) {
    const materials = [
        new THREE.MeshStandardMaterial({color:0x000000}), // right
        new THREE.MeshStandardMaterial({color:0x000000}), // left
        new THREE.MeshStandardMaterial({color:0x000000}), // top
        new THREE.MeshStandardMaterial({color:0x000000}), // bottom
        new THREE.MeshStandardMaterial({ // front
            map: sharedTexture,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: sharedTexture,
            emissiveIntensity: 1.2
        }),
        new THREE.MeshStandardMaterial({color:0x000000}) // back
    ];

    const geometry = new THREE.BoxGeometry(width, height, 0.3);
    const tv = new THREE.Mesh(geometry, materials);
    tv.position.copy(position);
    tv.position.y = height/2;

    // Play the video after first user interaction
    if(userInteracted && sharedVideo.paused) sharedVideo.play();

    return {mesh: tv, video: sharedVideo};
}
