import * as THREE from "three";

export function createCube(position, userInteracted) {
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

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: texture,
        emissiveIntensity: 1.2
    });

    const geometry = new THREE.BoxGeometry(1,1,1);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);

    if(userInteracted) video.play();
    return {mesh:cube, video};
}
