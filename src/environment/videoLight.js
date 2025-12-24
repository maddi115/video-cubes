import * as THREE from "three";

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 16;
offscreenCanvas.height = 16;
const ctx = offscreenCanvas.getContext('2d');

export function attachVideoLight(video, mesh, scene, options={}) {
    const { intensity=1, distance=5, smoothing=0.1 } = options;

    const light = new THREE.PointLight(0xffffff, intensity, distance);
    light.position.copy(mesh.position);
    light.position.y += mesh.geometry.parameters.height/2 || 1;
    scene.add(light);

    const targetColor = new THREE.Color(0xffffff);

    function updateLight() {
        if(video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const data = ctx.getImageData(0,0,offscreenCanvas.width,offscreenCanvas.height).data;
            let r=0,g=0,b=0;
            const len = data.length/4;
            for(let i=0;i<len;i++){
                r += data[i*4+0];
                g += data[i*4+1];
                b += data[i*4+2];
            }
            r = r/len/255;
            g = g/len/255;
            b = b/len/255;
            targetColor.setRGB(r,g,b);
            light.color.lerp(targetColor, smoothing);
        }
        requestAnimationFrame(updateLight);
    }
    updateLight();

    return light;
}
