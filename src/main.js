import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

/* ---------- SCENE & CAMERA ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.style.margin = '0';
document.body.style.overflow = 'hidden'; // disable scrollbars
document.documentElement.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

/* ---------- LIGHT ---------- */
scene.add(new THREE.AmbientLight(0xffffff,0.4));
scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1.2));
const sun = new THREE.DirectionalLight(0xffffff,1.5);
sun.position.set(10,15,10);
scene.add(sun);

/* ---------- GROUND ---------- */
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50,50),
    new THREE.MeshStandardMaterial({color:0x666666})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

/* ---------- CUBES & VIDEO ---------- */
const blocks = [];
let userInteracted = false;

function createVideoCube(position){
    const video = document.createElement("video");
    video.src = "/video.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: texture,
        emissiveIntensity:1.2
    });

    const geometry = new THREE.BoxGeometry(1,1,1);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    scene.add(cube);
    blocks.push({mesh:cube, video});

    if(userInteracted) video.play();
    return cube;
}

function createTVBlock(position){
    const video = document.createElement("video");
    video.src = "/video.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const materials = [
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({color:0x000000}),
        new THREE.MeshStandardMaterial({
            map: texture,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: texture,
            emissiveIntensity:1.2
        }),
        new THREE.MeshStandardMaterial({color:0x000000})
    ];

    const geometry = new THREE.BoxGeometry(5,2,0.3);
    const tv = new THREE.Mesh(geometry, materials);
    tv.position.copy(position);
    tv.position.y = 1;
    scene.add(tv);
    blocks.push({mesh:tv, video});

    if(userInteracted) video.play();
    return tv;
}

/* ---------- POINTER LOCK CONTROLS ---------- */
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => { controls.lock(); });

const move = {forward:false,backward:false,left:false,right:false};
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 5;
let canJump = false;
const gravity = 9.8;

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

/* ---------- SPAWN IN FRONT OF CAMERA ---------- */
function spawnBlock(type){
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const pos = camera.position.clone().add(dir.multiplyScalar(type==='cube'?2:3));
    if(type==='cube') createVideoCube(pos);
    else createTVBlock(pos);
}

/* ---------- HOTBAR (FIXED 2D OVERLAY) ---------- */
const hotbarSlots = ['cube','tv'];
let selectedIndex = 0;
const uiCanvas = document.createElement('canvas');
uiCanvas.width = window.innerWidth;
uiCanvas.height = 100;
uiCanvas.style.position = 'absolute';
uiCanvas.style.bottom = '10px';
uiCanvas.style.left = '0px';
uiCanvas.style.pointerEvents = 'none'; // allow clicks to pass through
document.body.appendChild(uiCanvas);
const uiCtx = uiCanvas.getContext('2d');

function drawHotbar(){
    uiCtx.clearRect(0,0,uiCanvas.width,uiCanvas.height);
    const slotWidth = 80;
    const totalWidth = slotWidth * hotbarSlots.length;
    const startX = (uiCanvas.width - totalWidth)/2;
    uiCtx.fillStyle = 'rgba(30,30,30,0.8)';
    uiCtx.fillRect(startX-5,10,totalWidth+10,40);
    hotbarSlots.forEach((item,i)=>{
        uiCtx.fillStyle = (i===selectedIndex)?'yellow':'white';
        uiCtx.fillRect(startX+i*slotWidth+5,15,slotWidth-10,30);
        uiCtx.fillStyle='black';
        uiCtx.font='14px monospace';
        uiCtx.fillText(item.toUpperCase(), startX+i*slotWidth+15, 37);
    });
}

/* ---------- SCROLL WHEEL TO CYCLE ---------- */
window.addEventListener('wheel',(e)=>{
    if(e.deltaY<0) selectedIndex = (selectedIndex-1+hotbarSlots.length)%hotbarSlots.length;
    else selectedIndex = (selectedIndex+1)%hotbarSlots.length;
    drawHotbar();
    e.preventDefault();
},{passive:false});

/* ---------- LEFT CLICK SPAWN ---------- */
window.addEventListener('click',(e)=>{
    if(!controls.isLocked) return;
    spawnBlock(hotbarSlots[selectedIndex]);
    if(!userInteracted){userInteracted=true; blocks.forEach(b=>b.video.play());}
});

/* ---------- DELETE BLOCK ---------- */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("click",(event)=>{
    if(!controls.isLocked) return;
    mouse.x=(event.clientX/window.innerWidth)*2-1;
    mouse.y=-(event.clientY/window.innerHeight)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const hits = raycaster.intersectObjects([ground,...blocks.map(b=>b.mesh)]);
    if(hits.length>0){
        const hit=hits[0];
        if(event.shiftKey){
            const idx = blocks.findIndex(b=>b.mesh===hit.object);
            if(idx!==-1){
                scene.remove(blocks[idx].mesh);
                blocks[idx].video.pause();
                blocks.splice(idx,1);
            }
        }
    }
});

/* ---------- DISABLE BROWSER SCROLL ---------- */
window.addEventListener('scroll', e=>e.preventDefault(), {passive:false});

/* ---------- ANIMATION LOOP ---------- */
const clock = new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if(controls.isLocked){
        direction.x=Number(move.right)-Number(move.left);
        direction.z=Number(move.forward)-Number(move.backward);
        direction.normalize();
        controls.moveRight(direction.x*speed*delta);
        controls.moveForward(direction.z*speed*delta);

        velocity.y -= gravity*delta;
        camera.position.y += velocity.y*delta;
        if(camera.position.y<2){velocity.y=0; camera.position.y=2; canJump=true;}
    }

    drawHotbar();
    renderer.render(scene,camera);
}
animate();
