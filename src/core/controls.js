import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

export function setupControls(camera, domElement) {
    const controls = new PointerLockControls(camera, domElement);
    document.body.addEventListener('click', () => { controls.lock(); });

    const move = {forward:false,backward:false,left:false,right:false};
    const velocity = {x:0,y:0,z:0};
    const speed = 5;
    const gravity = 9.8;
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

    return {controls, move, velocity, speed, gravity, canJump};
}
