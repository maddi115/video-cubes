const loadedVideos = {};
const loadedImages = {};

export function loadVideo(name, src) {
    if(loadedVideos[name]) return loadedVideos[name];
    const video = document.createElement('video');
    video.src = src;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    loadedVideos[name] = video;
    return video;
}

export function loadImage(name, src) {
    if(loadedImages[name]) return loadedImages[name];
    const img = new Image();
    img.src = src;
    loadedImages[name] = img;
    return img;
}

export { loadedVideos, loadedImages };
