import * as THREE from "three";

export function setupNight(scene) {
    // Night sky background
    scene.background = new THREE.Color(0x050517); // very dark blue
    scene.fog = new THREE.Fog(0x050517, 5, 60);

    // Ambient light (cool blue)
    const ambient = new THREE.AmbientLight(0x6666ff, 0.3);
    scene.add(ambient);

    // Directional "moonlight"
    const moon = new THREE.DirectionalLight(0xaaaaee, 0.5);
    moon.position.set(10, 20, 10);
    moon.castShadow = true;
    scene.add(moon);

    // Optional: faint stars (small points)
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 200;
    const starPositions = [];
    for (let i=0; i<starCount; i++){
        starPositions.push(
            (Math.random()-0.5)*100,
            Math.random()*50+5,
            (Math.random()-0.5)*100
        );
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions,3));
    const starMaterial = new THREE.PointsMaterial({color:0xffffff, size:0.2});
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}
