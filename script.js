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
  document.getElementById("exactDays").textContent=totalDays.toLocaleString()+" days together — and counting ♡";
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
  const modal=document.getElementById("letterModal");
  const closeBtn=document.getElementById("letterClose");
  const transition=document.getElementById("heartTransition");
  const particles=document.getElementById("heartParticles");
  let opening=false;

  const buildHearts=()=>{
    if(!particles)return;
    particles.innerHTML="";
    const positions=[
      [-110,-180,-18,18,0],[-72,-220,12,15,70],[-25,-185,-8,20,120],
      [35,-225,18,16,40],[82,-175,-14,22,100],[120,-120,16,17,150],
      [135,-35,-18,21,30],[110,55,12,16,110],[70,120,-10,20,60],
      [20,155,18,17,130],[-35,145,-15,22,20],[-85,110,10,16,100],
      [-125,45,-12,19,50],[-140,-35,16,16,140],[-105,-105,-16,21,80],
      [58,-95,12,15,170],[-52,-80,-8,18,160],[88,15,14,17,90]
    ];
    positions.forEach(([x,y,r,size,delay])=>{
      const heart=document.createElement("span");
      heart.className="heart-particle";
      heart.textContent="♥";
      heart.style.setProperty("--x",x+"px");
      heart.style.setProperty("--y",y+"px");
      heart.style.setProperty("--r",r+"deg");
      heart.style.setProperty("--size",size+"px");
      heart.style.setProperty("--delay",delay+"ms");
      heart.style.setProperty("--duration",(850+delay)+"ms");
      particles.appendChild(heart);
    });
  };

  const showLetter=()=>{
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("letter-open");
    modal.querySelector(".letter-modal-sheet")?.scrollTo({top:0,left:0,behavior:"auto"});
    opening=false;
  };

  const openLetter=()=>{
    if(opening)return;
    opening=true;
    buildHearts();
    transition.classList.remove("hide");
    transition.classList.add("show");
    transition.setAttribute("aria-hidden","false");
    if(navigator.vibrate)navigator.vibrate([30,30,45]);

    setTimeout(()=>{
      transition.classList.add("hide");
      showLetter();
    },1050);

    setTimeout(()=>{
      transition.classList.remove("show","hide");
      transition.setAttribute("aria-hidden","true");
    },1450);
  };

  const closeLetter=()=>{
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("letter-open");
  };

  btn?.addEventListener("click",openLetter);
  closeBtn?.addEventListener("click",closeLetter);
  modal?.querySelector("[data-close-letter]")?.addEventListener("click",closeLetter);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLetter()});
});