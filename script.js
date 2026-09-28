const START_DATE=new Date("2026-01-28T00:00:00+08:00");

async function loadPhotos(){
  const photos=[...document.querySelectorAll(".photo-b64")];
  await Promise.all(photos.map(async img=>{
    try{
      const path=img.dataset.b64;
      const res=await fetch(path,{cache:"force-cache"});
      if(!res.ok) throw new Error("Photo failed to load");
      const b64=(await res.text()).trim();
      img.src="data:image/jpeg;base64,"+b64;
      img.addEventListener("load",()=>img.style.animation="none",{once:true});
    }catch(err){
      console.error(err);
      img.alt="Photo unavailable";
    }
  }));
}

function updateCounter(){
  const now=new Date();
  let totalMonths=(now.getFullYear()-START_DATE.getFullYear())*12+(now.getMonth()-START_DATE.getMonth());
  const anchor=new Date(START_DATE);
  anchor.setMonth(anchor.getMonth()+totalMonths);
  if(anchor>now){totalMonths-=1;anchor.setMonth(anchor.getMonth()-1)}
  const diff=Math.max(0,now-anchor);
  const days=Math.floor(diff/86400000);
  const hours=Math.floor((diff%86400000)/3600000);
  const totalDays=Math.max(0,Math.floor((now-START_DATE)/86400000));
  document.getElementById("months").textContent=totalMonths;
  document.getElementById("days").textContent=days;
  document.getElementById("hours").textContent=hours;
  document.getElementById("exactDays").textContent=totalDays.toLocaleString()+" days of us — and counting.";
}

document.addEventListener("DOMContentLoaded",()=>{
  loadPhotos();
  updateCounter();
  setInterval(updateCounter,60000);

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("visible")});
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

  const btn=document.getElementById("surpriseBtn");
  const message=document.getElementById("hiddenMessage");
  btn?.addEventListener("click",()=>{
    const open=message.classList.toggle("open");
    message.setAttribute("aria-hidden",String(!open));
    btn.textContent=open?"For you, always ♥":"Open my message ♥";
    if(open&&navigator.vibrate)navigator.vibrate([35,35,50]);
  });
});