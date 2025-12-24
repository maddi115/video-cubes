import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { createCube } from './blocks/cube.js';
import { createTV } from './blocks/tv.js';
import { createHotbar } from './ui/hotbar.js';
import { loadVideo } from './assets/assets.js';
import { SPEED, GRAVITY } from './constants.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,2,5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff,0.4);
const hemi = new THREE.HemisphereLight(0xffffff,0x444444,1.2);
const sun = new THREE.DirectionalLight(0xffffff,1.5);
sun.position.set(10,15,10);
scene.add(ambient, hemi, sun);

// Ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(50,50), new THREE.MeshStandardMaterial({color:0x666666}));
ground.rotation.x = -Math.PI/2;
scene.add(ground);

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

function spawnBlock(type){
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const pos = camera.position.clone().add(dir.multiplyScalar(type==='cube'?2:3));
    let obj;
    if(type==='cube') obj = createCube(pos, userInteracted);
    else obj = createTV(pos, userInteracted);
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

// Raycaster for block deletion
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("click",(event)=>{
    if(!controls.isLocked) return;
    if(!event.shiftKey) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects([ground,...blocks.map(b=>b.mesh)]);
    if(hits.length>0){
        const idx = blocks.findIndex(b=>b.mesh===hits[0].object);
        if(idx!==-1){
            scene.remove(blocks[idx].mesh);
            blocks[idx].video.pause();
            blocks.splice(idx,1);
        }
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

// --- Test cube ---
const testCubeGeometry = new THREE.BoxGeometry();
const testCubeMaterial = new THREE.MeshStandardMaterial({color:0xff0000});
const testCube = new THREE.Mesh(testCubeGeometry,testCubeMaterial);
testCube.position.set(0,1,0);
scene.add(testCube);

// --- Test video cube ---
const videoObj = createCube(new THREE.Vector3(2,1,0), userInteracted);
scene.add(videoObj.mesh);

// --- Animation Loop ---
const clock = new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if(controls.isLocked){
        const dir = new THREE.Vector3();
        dir.x = Number(move.right) - Number(move.left);   // A/D sideways
        dir.z = Number(move.forward) - Number(move.backward); // W/S corrected
        dir.normalize();
        controls.moveRight(dir.x * SPEED * delta);
        controls.moveForward(dir.z * SPEED * delta);

        velocity.y -= GRAVITY * delta;
        camera.position.y += velocity.y * delta;
        if(camera.position.y < 2){velocity.y = 0; camera.position.y = 2; canJump = true;}
    }

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
