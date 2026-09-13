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
   RuangBaca v2.2 — INTERACTIVE NATIVE SWIPE
   Home <-> Library <-> Profile
   ========================================================= */

(function(){

  const pages = ['home','library','profile'];
  const app = document.querySelector('.app');

  if(!app) return;

  let startX = 0;
  let startY = 0;
  let currentX = 0;

  let currentPage = null;
  let nextPage = null;

  let currentIndex = -1;
  let nextIndex = -1;

  let direction = 0;
  let dragging = false;
  let horizontal = false;

  let raf = 0;

  function getActive(){
    return document.querySelector('.page.active');
  }

  function prepare(directionValue){

    currentPage = getActive();

    if(!currentPage) return false;

    currentIndex = pages.indexOf(currentPage.id);

    if(currentIndex < 0) return false;

    nextIndex =
      directionValue < 0
        ? currentIndex + 1
        : currentIndex - 1;

    if(nextIndex < 0 || nextIndex >= pages.length){
      nextPage = null;
      return false;
    }

    nextPage = document.getElementById(pages[nextIndex]);

    if(!nextPage) return false;

    direction = directionValue;

    const top = currentPage.offsetTop;

    nextPage.style.display = 'block';
    nextPage.style.position = 'absolute';
    nextPage.style.top = top + 'px';
    nextPage.style.left = '0';
    nextPage.style.width = '100%';
    nextPage.style.zIndex = '5';
    nextPage.style.willChange = 'transform';

    currentPage.style.willChange = 'transform';

    const width = app.clientWidth || window.innerWidth;

    nextPage.style.transform =
      `translate3d(${direction < 0 ? width : -width}px,0,0)`;

    app.classList.add('rb-swiping');

    return true;
  }

  function update(){

    raf = 0;

    if(!dragging || !horizontal || !currentPage) return;

    const distance = currentX - startX;

    const width = app.clientWidth || window.innerWidth;

    let move = distance;

    /*
      Resistance ketika sudah berada di ujung.
    */
    if(!nextPage){
      move = distance * 0.22;

      currentPage.style.transform =
        `translate3d(${move}px,0,0)`;

      return;
    }

    /*
      Halaman utama mengikuti jari.
    */
    currentPage.style.transform =
      `translate3d(${move}px,0,0)`;

    /*
      Halaman berikutnya ikut masuk dari sisi layar.
    */
    const nextOffset =
      direction < 0
        ? width + move
        : -width + move;

    nextPage.style.transform =
      `translate3d(${nextOffset}px,0,0)`;
  }

  function requestUpdate(){

    if(!raf){
      raf = requestAnimationFrame(update);
    }
  }

  function cleanup(){

    if(currentPage){
      currentPage.style.transform = '';
      currentPage.style.willChange = '';
    }

    if(nextPage){

      nextPage.style.display = '';
      nextPage.style.position = '';
      nextPage.style.top = '';
      nextPage.style.left = '';
      nextPage.style.width = '';
      nextPage.style.zIndex = '';
      nextPage.style.transform = '';
      nextPage.style.willChange = '';
    }

    app.classList.remove('rb-swiping');

    currentPage = null;
    nextPage = null;
    currentIndex = -1;
    nextIndex = -1;
    direction = 0;
  }

  function finish(){

    if(!currentPage){
      cleanup();
      return;
    }

    const width = app.clientWidth || window.innerWidth;
    const distance = currentX - startX;

    /*
      Threshold ringan supaya swipe terasa responsif.
    */
    const passedDistance =
      Math.abs(distance) >= Math.max(28, width * 0.16);

    if(!nextPage || !passedDistance){

      currentPage.style.transition =
        'transform .18s cubic-bezier(.22,.8,.25,1)';

      currentPage.style.transform =
        'translate3d(0,0,0)';

      if(nextPage){

        nextPage.style.transition =
          'transform .18s cubic-bezier(.22,.8,.25,1)';

        nextPage.style.transform =
          `translate3d(${direction < 0 ? width : -width}px,0,0)`;
      }

      setTimeout(function(){

        if(currentPage){
          currentPage.style.transition = '';
        }

        if(nextPage){
          nextPage.style.transition = '';
        }

        cleanup();

      }, 190);

      return;
    }

    /*
      Selesaikan perpindahan.
    */
    currentPage.style.transition =
      'transform .16s cubic-bezier(.22,.8,.25,1)';

    currentPage.style.transform =
      `translate3d(${direction < 0 ? -width : width}px,0,0)`;

    nextPage.style.transition =
      'transform .16s cubic-bezier(.22,.8,.25,1)';

    nextPage.style.transform =
      'translate3d(0,0,0)';

    setTimeout(function(){

      showPage(pages[nextIndex]);

      cleanup();

    }, 160);
  }

  app.addEventListener('touchstart', function(e){

    if(!e.touches.length) return;

    const target = e.target;

    /*
      Area yang punya gesture sendiri.
    */
    if(
      target.closest('input') ||
      target.closest('button') ||
      target.closest('.horizontal') ||
      target.closest('.chips') ||
      target.closest('.reader') ||
      target.closest('.modal')
    ){
      dragging = false;
      horizontal = false;
      return;
    }

    const active = getActive();

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

    /*
      Tentukan arah gesture.
      Gerakan vertikal tetap menjadi scroll.
    */
    if(!horizontal){

      if(Math.abs(dx) < 8 && Math.abs(dy) < 8){
        return;
      }

      if(Math.abs(dy) > Math.abs(dx) * 1.15){

        dragging = false;
        horizontal = false;

        return;
      }

      if(Math.abs(dx) > Math.abs(dy)){

        horizontal = true;

        prepare(dx < 0 ? -1 : 1);

        requestUpdate();
      }

      return;
    }

    requestUpdate();

  }, {passive:true});


  app.addEventListener('touchend', function(){

    if(!dragging){
      cleanup();
      return;
    }

    dragging = false;

    if(horizontal){
      finish();
    }else{
      cleanup();
    }

  }, {passive:true});


  app.addEventListener('touchcancel', function(){

    dragging = false;
    horizontal = false;

    cleanup();

  }, {passive:true});

})();
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
