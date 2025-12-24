import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { createCube } from './blocks/cube.js';
import { createTV } from './blocks/tv.js';
import { createLargeTV } from './blocks/large-tv.js';
import { createHotbar } from './ui/hotbar.js';
import { SPEED, GRAVITY } from './constants.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05051a); // darker cinematic night
scene.fog = new THREE.Fog(0x05051a, 5, 30);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,2,5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0x4444ff, 0.2); // subtle bluish ambient
const hemi = new THREE.HemisphereLight(0x000033, 0x111111, 0.6);
const sun = new THREE.DirectionalLight(0x6666ff,0.3);
sun.position.set(10,15,10);
scene.add(ambient, hemi, sun);

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(12,12),
    new THREE.MeshStandardMaterial({color:0x223322, emissive:0x111111, roughness:0.9, metalness:0.1})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Torches
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

const torches = [
    addTorch(new THREE.Vector3(2,1,2)),
    addTorch(new THREE.Vector3(-2,1,-2)),
    addTorch(new THREE.Vector3(4,1,-3))
];

// Controls
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

// Hotbar
const hotbarSlots = ['cube','tv','large-tv'];
const hotbar = createHotbar(hotbarSlots);

// Blocks
const blocks = [];
let userInteracted = false;

function spawnBlock(type){
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const pos = camera.position.clone().add(dir.multiplyScalar(type==='cube'?2:type==='tv'?3:6));
    let obj;
    if(type==='cube') obj = createCube(pos, userInteracted);
    else if(type==='tv') obj = createTV(pos, userInteracted);
    else if(type==='large-tv') obj = createLargeTV(pos, userInteracted);
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

// Scroll-wheel hotbar selection
window.addEventListener('wheel',(e)=>{
    let idx = hotbar.getSelected();
    if(e.deltaY<0) idx = (idx-1+hotbarSlots.length)%hotbarSlots.length;
    else idx = (idx+1)%hotbarSlots.length;
    hotbar.setSelected(idx);
    e.preventDefault();
},{passive:false});

// Animation
const clock = new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if(controls.isLocked){
        const dir = new THREE.Vector3();
        dir.x = Number(move.right) - Number(move.left);
        dir.z = Number(move.forward) - Number(move.backward);
        dir.normalize();
        controls.moveRight(dir.x * SPEED * delta);
        controls.moveForward(dir.z * SPEED * delta);
        velocity.y -= GRAVITY * delta;
        camera.position.y += velocity.y * delta;
        if(camera.position.y < 2){velocity.y = 0; camera.position.y = 2; canJump = true;}
    }
    // Torch flicker
    const time = Date.now()*0.002;
    torches.forEach(t => t.intensity = 0.8 + Math.sin(time + t.position.x + t.position.z)*0.2);
    hotbar.draw();
    renderer.render(scene,camera);
}
animate();

// Window resize
window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Disable scroll
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';
