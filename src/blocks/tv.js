import * as THREE from "three";

/**
 * Creates a TV block with video that remains bright and emits colored light.
 * No glow mesh; light is separate.
 */
export function createTV(position, userInteracted, width=5, height=2) {
    const video = document.createElement('video');
    video.src = '/video.mp4';
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    const materials = [
        new THREE.MeshStandardMaterial({color:0x000000}), // right
        new THREE.MeshStandardMaterial({color:0x000000}), // left
        new THREE.MeshStandardMaterial({color:0x000000}), // top
        new THREE.MeshStandardMaterial({color:0x000000}), // bottom
        new THREE.MeshBasicMaterial({ // front - self-lit
            map: texture
        }),
        new THREE.MeshStandardMaterial({color:0x000000}) // back
    ];

    const geometry = new THREE.BoxGeometry(width, height, 0.3);
    const tv = new THREE.Mesh(geometry, materials);
    tv.position.copy(position);
    tv.position.y = height / 2;

    const light = new THREE.PointLight(0xffffff, 3, 20); // stronger light
    light.decay = 2;
    light.position.copy(position);
    light.position.y = height / 2;

    if(userInteracted) video.play();

    return {mesh: tv, video, light, videoTexture: texture};
}

export function createLargeTV(position, userInteracted) {
    return createTV(position, userInteracted, 19.2, 10.8);
}
