const START_DATE=new Date("2026-01-28T00:00:00+08:00");

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
  document.querySelectorAll("img").forEach(img=>{
    img.addEventListener("error",()=>{
      img.classList.add("image-missing");
      img.alt="Photo unavailable — upload the matching JPEG file to the repo root.";
    });
  });
  updateCounter();
  setInterval(updateCounter,60000);

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("visible")});
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));


  // Memories carousel: auto-advances every 5 seconds and resets after manual navigation.
  const carousel=document.getElementById("memoryCarousel");
  const slides=[...document.querySelectorAll(".memory-slide")];
  const dots=[...document.querySelectorAll(".carousel-dot")];
  const prevBtn=document.getElementById("carouselPrev");
  const nextBtn=document.getElementById("carouselNext");
  const timerBar=document.getElementById("carouselTimer");
  let currentSlide=0;
  let carouselTimeout=null;
  let touchStartX=0;

  const restartCarouselTimer=()=>{
    clearTimeout(carouselTimeout);
    if(timerBar){
      timerBar.classList.remove("running");
      void timerBar.offsetWidth;
      timerBar.classList.add("running");
    }
    carouselTimeout=setTimeout(()=>showSlide(currentSlide+1,1),5000);
  };

  const showSlide=(nextIndex,direction=1)=>{
    if(!slides.length)return;
    const normalized=(nextIndex+slides.length)%slides.length;
    if(normalized===currentSlide){
      restartCarouselTimer();
      return;
    }

    const outgoing=slides[currentSlide];
    const incoming=slides[normalized];

    outgoing.classList.remove("leaving-left","leaving-right");
    outgoing.classList.add(direction>0?"leaving-left":"leaving-right");

    incoming.classList.remove("active","leaving-left","leaving-right","enter-from-left");
    if(direction<0) incoming.classList.add("enter-from-left");
    void incoming.offsetWidth;
    incoming.classList.add("active");
    incoming.classList.remove("enter-from-left");

    dots[currentSlide]?.classList.remove("active");
    dots[normalized]?.classList.add("active");

    const oldIndex=currentSlide;
    currentSlide=normalized;

    setTimeout(()=>{
      slides[oldIndex]?.classList.remove("active","leaving-left","leaving-right");
    },760);

    restartCarouselTimer();
  };

  prevBtn?.addEventListener("click",()=>showSlide(currentSlide-1,-1));
  nextBtn?.addEventListener("click",()=>showSlide(currentSlide+1,1));
  dots.forEach((dot,index)=>dot.addEventListener("click",()=>{
    if(index===currentSlide)return restartCarouselTimer();
    showSlide(index,index>currentSlide?1:-1);
  }));

  carousel?.addEventListener("touchstart",e=>{
    touchStartX=e.changedTouches[0]?.clientX||0;
  },{passive:true});
  carousel?.addEventListener("touchend",e=>{
    const endX=e.changedTouches[0]?.clientX||0;
    const delta=endX-touchStartX;
    if(Math.abs(delta)>45) showSlide(currentSlide+(delta<0?1:-1),delta<0?1:-1);
  },{passive:true});

  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
      clearTimeout(carouselTimeout);
      timerBar?.classList.remove("running");
    }else{
      restartCarouselTimer();
    }
  });

  restartCarouselTimer();

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
    const sheet=modal.querySelector(".letter-modal-sheet");
    if(sheet) sheet.scrollTop=0;
    opening=false;
  };

  const hideHeartTransition=()=>{
    transition.classList.remove("show","hide");
    transition.setAttribute("aria-hidden","true");
    transition.style.display="none";
  };

  const openLetter=()=>{
    if(opening)return;
    opening=true;

    // Open the letter underneath first so it always appears even if an animation is interrupted.
    showLetter();

    buildHearts();
    transition.style.display="grid";
    transition.classList.remove("hide");
    transition.classList.add("show");
    transition.setAttribute("aria-hidden","false");

    if(navigator.vibrate)navigator.vibrate([30,30,45]);

    setTimeout(()=>transition.classList.add("hide"),700);
    setTimeout(hideHeartTransition,1050);

    // Failsafe for iOS/Safari: never allow the transition layer to get stuck.
    setTimeout(hideHeartTransition,1800);
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