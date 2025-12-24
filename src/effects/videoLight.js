import * as THREE from "three";

/**
 * Attaches a point light to a video-textured mesh.
 * Light color is extracted from the video frame and scales with mesh size.
 */
export function attachVideoLight(video, mesh, scene, options = {}) {
    const intensityBase = options.intensity || 5;
    const distanceBase = options.distance || 20;
    const decay = options.decay || 2;

    const scale = Math.max(mesh.geometry.parameters.width, mesh.geometry.parameters.height)/5;

    const pointLight = new THREE.PointLight(0xffffff, intensityBase*scale, distanceBase*scale, decay);
    pointLight.position.copy(mesh.position);
    pointLight.position.y += mesh.geometry.parameters.height / 2;
    scene.add(pointLight);

    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');

    function updateLight() {
        if(video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
            let r=0,g=0,b=0,count=0;
            for(let i=0;i<data.length;i+=4){
                r+=data[i]; g+=data[i+1]; b+=data[i+2]; count++;
            }
            r/=count; g/=count; b/=count;
            pointLight.color.setRGB(r/255, g/255, b/255);
        }
        requestAnimationFrame(updateLight);
    }
    updateLight();

    return pointLight;
}
