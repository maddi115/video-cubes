import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { createCube } from './blocks/cube.js';
import { createTV } from './blocks/tv.js';
import { createHotbar } from './ui/hotbar.js';
import { SPEED, GRAVITY } from './constants.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a); // Night sky
scene.fog = new THREE.Fog(0x0a0a1a, 5, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,2,5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0x5555ff, 0.5); // dim bluish
const hemi = new THREE.HemisphereLight(0x000044, 0x111111, 0.8);
const sun = new THREE.DirectionalLight(0x6666ff,1.0);
sun.position.set(10,15,10);
scene.add(ambient, hemi, sun);

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50,50),
    new THREE.MeshStandardMaterial({color:0x223322, emissive:0x111111})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// --- Torch helper ---
function addTorch(position){
    const torchLight = new THREE.PointLight(0xffaa33, 1, 10);
    torchLight.position.copy(position);
    scene.add(torchLight);

    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({color:0xffaa33, emissive:0xffaa33})
    );
    sphere.position.copy(position);
    scene.add(sphere);

    return torchLight;
}

// Place some torches
const torches = [
    addTorch(new THREE.Vector3(2,1,2)),
    addTorch(new THREE.Vector3(-2,1,-2)),
    addTorch(new THREE.Vector3(4,1,-3))
];

// --- Controls ---
const controls = new PointerLockControls(camera, renderer.domElement);
document.body.addEventListener('click',()=>controls.lock());

const move = {forward:false,backward:false,left:false,right:false};
const velocity = {x:0,y:0,z:0};
let canJump = false;

document.addEventListener('keydown',(e)=>{
    switch(e.code){
        case 'KeyW': move.forward=true; break;
        case 'KeyS': move.backward=true; break;
        case 'KeyA': move.left=true; break;
        case 'KeyD': move.right=true; break;
        case 'Space': if(canJump){velocity.y=5; canJump=false;} break;
    }
});
document.addEventListener('keyup',(e)=>{
    switch(e.code){
        case 'KeyW': move.forward=false; break;
        case 'KeyS': move.backward=false; break;
        case 'KeyA': move.left=false; break;
        case 'KeyD': move.right=false; break;
    }
});

// --- Hotbar UI ---
const hotbarSlots = ['cube','tv'];
const hotbar = createHotbar(hotbarSlots);

// --- Blocks ---
const blocks = [];
let userInteracted = false;

// Default TV dimensions
let tvWidth = 5;
let tvHeight = 2;

function spawnBlock(type){
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const pos = camera.position.clone().add(dir.multiplyScalar(type==='cube'?2:3));
    let obj;
    if(type==='cube') obj = createCube(pos, userInteracted);
    else obj = createTV(pos, userInteracted, tvWidth, tvHeight);
    scene.add(obj.mesh);
    blocks.push(obj);
    if(userInteracted) obj.video.play();
}

// Mouse click spawns block
window.addEventListener('click',()=>{
    if(!controls.isLocked) return;
    spawnBlock(hotbarSlots[hotbar.getSelected()]);
    if(!userInteracted){
        userInteracted = true;
        blocks.forEach(b=>b.video.play());
    }
});

// Adjust TV size with keys
window.addEventListener('keydown',(e)=>{
    if(e.code==='ArrowUp') tvHeight += 0.5;
    if(e.code==='ArrowDown') tvHeight = Math.max(0.5, tvHeight - 0.5);
    if(e.code==='ArrowRight') tvWidth += 0.5;
    if(e.code==='ArrowLeft') tvWidth = Math.max(0.5, tvWidth - 0.5);
});

// Scroll-wheel hotbar selection
window.addEventListener('wheel',(e)=>{
    let idx = hotbar.getSelected();
    if(e.deltaY<0) idx = (idx-1+hotbarSlots.length)%hotbarSlots.length;
    else idx = (idx+1)%hotbarSlots.length;
    hotbar.setSelected(idx);
    e.preventDefault();
},{passive:false});

// --- Test cube ---
const testCubeGeometry = new THREE.BoxGeometry();
const testCubeMaterial = new THREE.MeshStandardMaterial({color:0xff0000});
const testCube = new THREE.Mesh(testCubeGeometry,testCubeMaterial);
testCube.position.set(0,1,0);
scene.add(testCube);

// --- Animation Loop ---
const clock = new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if(controls.isLocked){
        const dir = new THREE.Vector3();
        dir.x = Number(move.right) - Number(move.left);
        dir.z = Number(move.forward) - Number(move.backward); // W/S corrected
        dir.normalize();
        controls.moveRight(dir.x * SPEED * delta);
        controls.moveForward(dir.z * SPEED * delta);

        velocity.y -= GRAVITY * delta;
        camera.position.y += velocity.y * delta;
        if(camera.position.y < 2){velocity.y = 0; camera.position.y = 2; canJump = true;}
    }

    // Torch flicker effect
    const time = Date.now() * 0.002;
    torches.forEach(t => t.intensity = 0.8 + Math.sin(time + t.position.x + t.position.z)*0.2);

    hotbar.draw();
    renderer.render(scene, camera);
}
animate();

// --- Window resize ---
window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Disable browser scroll ---
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';
