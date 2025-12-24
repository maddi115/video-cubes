import * as THREE from "three";

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
        new THREE.MeshStandardMaterial({ // front
            map: texture,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: texture,
            emissiveIntensity:1.2
        }),
        new THREE.MeshStandardMaterial({color:0x000000}) // back
    ];

    const geometry = new THREE.BoxGeometry(width, height, 0.3);
    const tv = new THREE.Mesh(geometry, materials);
    tv.position.copy(position);
    tv.position.y = height/2;

    if(userInteracted) video.play();
    return {mesh:tv, video};
}

// Large TV block (1920x1080 scaled to scene units)
export function createLargeTV(position, userInteracted) {
    const width = 19.2;  // scaled width
    const height = 10.8; // scaled height
    return createTV(position, userInteracted, width, height);
}
