export function createHotbar(hotbarSlots) {
    // ensure 'large-tv' is included
    if(!hotbarSlots.includes('large-tv')) hotbarSlots.push('large-tv');

    let selectedIndex = 0;
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = 100;
    canvas.style.position = 'absolute';
    canvas.style.bottom = '10px';
    canvas.style.left = '0px';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        const slotWidth = 80;
        const totalWidth = slotWidth * hotbarSlots.length;
        const startX = (canvas.width - totalWidth)/2;
        ctx.fillStyle = 'rgba(30,30,30,0.8)';
        ctx.fillRect(startX-5,10,totalWidth+10,40);
        hotbarSlots.forEach((item,i)=>{
            ctx.fillStyle = (i===selectedIndex)?'yellow':'white';
            ctx.fillRect(startX+i*slotWidth+5,15,slotWidth-10,30);
            ctx.fillStyle='black';
            ctx.font='14px monospace';
            const label = item==='large-tv'?'L-TV':item.toUpperCase();
            ctx.fillText(label, startX+i*slotWidth+15, 37);
        });
    }
    draw();

    window.addEventListener('resize',()=>{canvas.width=window.innerWidth; canvas.height=100; draw();});
    return {draw, canvas, getSelected:()=>selectedIndex, setSelected:(i)=>{selectedIndex=i;draw();}};
}
