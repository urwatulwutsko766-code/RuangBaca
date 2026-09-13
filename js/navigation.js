const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function showPage(page){
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===page));
  $$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  window.scrollTo(0,0);
}

function openReader(){ $('#reader').style.display='block'; }
function closeReader(){ $('#reader').style.display='none'; }
function openAdd(){ $('#addModal').style.display='flex'; }
function closeAdd(){ $('#addModal').style.display='none'; }

$$('.nav').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
$$('[data-action="reader"]').forEach(btn=>btn.addEventListener('click',openReader));
$$('[data-action="close-reader"]').forEach(btn=>btn.addEventListener('click',closeReader));
$$('[data-action="add"]').forEach(btn=>btn.addEventListener('click',openAdd));
$$('[data-action="close-add"]').forEach(btn=>btn.addEventListener('click',closeAdd));
$('#reader').addEventListener('click',(e)=>{if(e.target===e.currentTarget)closeReader()});

function toggleReaderTheme(){
  const reader = $('#reader');
  reader.classList.toggle('dark');
}

$$('[data-action="reader-theme"]').forEach(btn =>
  btn.addEventListener('click', toggleReaderTheme)
);

/* =========================================================
   RuangBaca v2.2 — INTERACTIVE SWIPE
   Halaman mengikuti jari secara real-time
   Home <-> Library <-> Profile
   ========================================================= */

(function(){

  const pages = ['home', 'library', 'profile'];
  const app = document.querySelector('.app');

  if(!app) return;

  let startX = 0;
  let startY = 0;
  let currentX = 0;

  let dragging = false;
  let horizontal = false;

  let currentPage = null;
  let currentIndex = -1;
  let nextPage = null;
  let nextIndex = -1;

  let raf = 0;

  function getActivePage(){
    return document.querySelector('.page.active');
  }

  function prepareNext(direction){

    currentPage = getActivePage();

    if(!currentPage) return false;

    currentIndex = pages.indexOf(currentPage.id);

    if(currentIndex < 0) return false;

    nextIndex = direction < 0
      ? currentIndex + 1
      : currentIndex - 1;

    if(nextIndex < 0 || nextIndex >= pages.length){
      nextPage = null;
      return false;
    }

    nextPage = document.getElementById(pages[nextIndex]);

    if(!nextPage) return false;

    nextPage.style.display = 'block';
    nextPage.style.position = 'absolute';
    nextPage.style.top = '0';
    nextPage.style.left = '0';
    nextPage.style.width = '100%';

    nextPage.style.transform =
      `translate3d(${direction < 0 ? '100%' : '-100%'},0,0)`;

    nextPage.style.willChange = 'transform';

    currentPage.style.willChange = 'transform';

    return true;
  }

  function renderSwipe(){

    raf = 0;

    if(!dragging || !horizontal || !nextPage) return;

    const distance = currentX - startX;

    let move = distance;

    const direction = nextIndex > currentIndex ? -1 : 1;

    /* Resistance saat menarik halaman di ujung */
    if(
      (currentIndex === 0 && distance > 0) ||
      (currentIndex === pages.length - 1 && distance < 0)
    ){
      move = distance * 0.25;
    }

    currentPage.style.transform =
      `translate3d(${move}px,0,0)`;

    if(nextPage){
      const width = app.clientWidth || window.innerWidth;

      nextPage.style.transform =
        `translate3d(${direction < 0
          ? width + move
          : -width + move}px,0,0)`;
    }
  }

  function requestRender(){

    if(!raf){
      raf = requestAnimationFrame(renderSwipe);
    }
  }

  function resetPages(){

    if(!currentPage) return;

    currentPage.style.transform = '';
    currentPage.style.willChange = '';

    if(nextPage){
      nextPage.style.transform = '';
      nextPage.style.position = '';
      nextPage.style.top = '';
      nextPage.style.left = '';
      nextPage.style.width = '';
      nextPage.style.willChange = '';
      nextPage.style.display = '';
    }

    currentPage = null;
    nextPage = null;
  }

  function finishSwipe(){

    const distance = currentX - startX;
    const width = app.clientWidth || window.innerWidth;

    const velocityEnough = Math.abs(distance) > 35;
    const distanceEnough = Math.abs(distance) > width * 0.18;

    const shouldChange =
      horizontal &&
      nextPage &&
      (velocityEnough || distanceEnough);

    if(!shouldChange){

      if(currentPage){
        currentPage.style.transition =
          'transform .18s cubic-bezier(.22,.8,.25,1)';

        currentPage.style.transform =
          'translate3d(0,0,0)';
      }

      if(nextPage){
        nextPage.style.transition =
          'transform .18s cubic-bezier(.22,.8,.25,1)';

        nextPage.style.transform =
          `translate3d(${nextIndex > currentIndex
            ? width
            : -width}px,0,0)`;
      }

      setTimeout(resetPages, 190);
      return;
    }

    const direction = nextIndex > currentIndex ? -1 : 1;

    if(currentPage){
      currentPage.style.transition =
        'transform .18s cubic-bezier(.22,.8,.25,1)';

      currentPage.style.transform =
        `translate3d(${direction * width}px,0,0)`;
    }

    if(nextPage){
      nextPage.style.transition =
        'transform .18s cubic-bezier(.22,.8,.25,1)';

      nextPage.style.transform =
        'translate3d(0,0,0)';
    }

    setTimeout(function(){

      showPage(pages[nextIndex]);

      resetPages();

    }, 190);
  }

  app.addEventListener('touchstart', function(e){

    if(!e.touches.length) return;

    const target = e.target;

    if(
      target.closest('input') ||
      target.closest('button') ||
      target.closest('.horizontal') ||
      target.closest('.chips') ||
      target.closest('.reader') ||
      target.closest('.modal')
    ){
      return;
    }

    const active = getActivePage();

    if(!active) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;

    currentPage = active;

    dragging = true;
    horizontal = false;

  }, {passive:true});


  app.addEventListener('touchmove', function(e){

    if(!dragging || !e.touches.length) return;

    currentX = e.touches[0].clientX;

    const currentY = e.touches[0].clientY;

    const dx = currentX - startX;
    const dy = currentY - startY;

    /* Tentukan arah setelah gerakan cukup jelas */
    if(!horizontal){

      if(Math.abs(dx) < 8 && Math.abs(dy) < 8){
        return;
      }

      if(Math.abs(dy) > Math.abs(dx) * 1.15){
        dragging = false;
        return;
      }

      if(Math.abs(dx) > Math.abs(dy)){
        horizontal = true;

        const direction = dx < 0 ? -1 : 1;

        prepareNext(direction);

        if(!nextPage){
          /* Tetap izinkan resistance di ujung */
          requestRender();
          return;
        }
      }
    }

    if(horizontal){
      requestRender();
    }

  }, {passive:true});


  app.addEventListener('touchend', function(){

    if(!dragging){
      resetPages();
      return;
    }

    dragging = false;

    if(horizontal){
      finishSwipe();
    }else{
      resetPages();
    }

  }, {passive:true});


  app.addEventListener('touchcancel', function(){

    dragging = false;
    horizontal = false;

    resetPages();

  }, {passive:true});

})();
