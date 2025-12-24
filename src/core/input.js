export function setupScrollSelection(hotbarSlots, callback) {
    let selectedIndex = 0;
    window.addEventListener('wheel',(e)=>{
        if(e.deltaY<0) selectedIndex = (selectedIndex-1+hotbarSlots.length)%hotbarSlots.length;
        else selectedIndex = (selectedIndex+1)%hotbarSlots.length;
        callback(selectedIndex);
        e.preventDefault();
    },{passive:false});
    return () => selectedIndex;
}
