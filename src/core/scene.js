import * as THREE from "three";

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff,0.4);
    const hemi = new THREE.HemisphereLight(0xffffff,0x444444,1.2);
    const sun = new THREE.DirectionalLight(0xffffff,1.5);
    sun.position.set(10,15,10);
    scene.add(ambient, hemi, sun);

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(50,50),
        new THREE.MeshStandardMaterial({color:0x666666})
    );
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    return {scene, camera, renderer, ground};
}
