import * as THREE from "three";

export function createLargeTV(position, userInteracted) {
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
            emissiveIntensity:1.0
        }),
        new THREE.MeshStandardMaterial({color:0x000000}) // back
    ];

    const width = 10; // scaled units
    const height = 5; // scaled units
    const geometry = new THREE.BoxGeometry(width, height, 0.3);
    const tv = new THREE.Mesh(geometry, materials);
    tv.position.copy(position);
    tv.position.y = height/2;

    // subtle glow lights around corners
    const lights = [];
    const offsets = [
        [-width/2, height/2, 0.15],
        [width/2, height/2, 0.15],
        [-width/2, -height/2, 0.15],
        [width/2, -height/2, 0.15]
    ];
    offsets.forEach(offset => {
        const light = new THREE.PointLight(0xffffff, 0.4, 6);
        light.position.set(position.x + offset[0], position.y + offset[1], position.z + offset[2]);
        tv.add(light);
        lights.push(light);
    });

    if(userInteracted) video.play();
    return { mesh: tv, video, lights };
}
