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
   RuangBaca v2.3 — FULL SCREEN NATIVE SWIPE
   Home <-> Library <-> Profile
   ========================================================= */

(function(){

  const pages = ['home','library','profile'];
  const app = document.querySelector('.app');
  const main = document.querySelector('main');
  const top = document.querySelector('.top');
  const fab = document.querySelector('.fab');
  const bottom = document.querySelector('.bottom');

  if(!app || !main) return;

  const movingParts = [top, main, fab, bottom].filter(Boolean);

  let startX = 0;
  let startY = 0;
  let currentX = 0;

  let currentPage = null;
  let nextPage = null;

  let nextIndex = -1;
  let direction = 0;

  let dragging = false;
  let horizontal = false;
  let movedEnough = false;

  let raf = 0;

  function getActive(){
    return document.querySelector('.page.active');
  }

  function setTransform(value){
    movingParts.forEach(el => {
      el.style.transform = value;
    });
  }

  function clearTransform(){
    movingParts.forEach(el => {
      el.style.transform = '';
      el.style.transition = '';
      el.style.willChange = '';
    });
  }

  function prepare(dir){

    currentPage = getActive();

    if(!currentPage) return false;

    const currentIndex = pages.indexOf(currentPage.id);

    if(currentIndex < 0) return false;

    nextIndex = dir < 0
      ? currentIndex + 1
      : currentIndex - 1;

    if(nextIndex < 0 || nextIndex >= pages.length){
      nextPage = null;
      direction = dir;
      return false;
    }

    nextPage = document.getElementById(pages[nextIndex]);

    if(!nextPage) return false;

    direction = dir;

    const width = app.clientWidth || window.innerWidth;

    /*
      Next page masuk dari sisi layar.
      Main ikut bergerak bersama header, FAB dan bottom nav.
    */
    nextPage.style.display = 'block';
    nextPage.style.position = 'absolute';
    nextPage.style.top = currentPage.offsetTop + 'px';
    nextPage.style.left = '0';
    nextPage.style.width = '100%';
    nextPage.style.zIndex = '5';
    nextPage.style.willChange = 'transform';

    nextPage.style.transform =
      `translate3d(${dir < 0 ? width : -width}px,0,0)`;

    movingParts.forEach(el => {
      el.style.willChange = 'transform';
    });

    app.classList.add('rb-swiping');
    document.body.style.overflowX = 'hidden';

    return true;
  }

  function update(){

    raf = 0;

    if(!dragging || !horizontal) return;

    const width = app.clientWidth || window.innerWidth;
    const distance = currentX - startX;

    let move = distance;

    /*
      Resistance di ujung Home/Profile.
    */
    if(!nextPage){

      move = distance * 0.22;

      setTransform(`translate3d(${move}px,0,0)`);

      return;
    }

    /*
      Seluruh layar mengikuti jari.
    */
    setTransform(`translate3d(${move}px,0,0)`);

    /*
      Halaman berikutnya ikut masuk.
    */
    const nextOffset = direction < 0
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

    clearTransform();

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
    document.body.style.overflowX = '';

    currentPage = null;
    nextPage = null;
    nextIndex = -1;
    direction = 0;

    dragging = false;
    horizontal = false;
    movedEnough = false;
  }

  function finish(){

    if(!currentPage){
      cleanup();
      return;
    }

    const width = app.clientWidth || window.innerWidth;
    const distance = currentX - startX;

    const threshold =
      Math.max(42, width * 0.18);

    const passed =
      Math.abs(distance) >= threshold;

    /*
      Tidak cukup jauh -> kembali ke posisi awal.
    */
    if(!nextPage || !passed){

      movingParts.forEach(el => {
        el.style.transition =
          'transform .22s cubic-bezier(.22,.8,.25,1)';
      });

      setTransform('translate3d(0,0,0)');

      if(nextPage){

        nextPage.style.transition =
          'transform .22s cubic-bezier(.22,.8,.25,1)';

        nextPage.style.transform =
          `translate3d(${direction < 0 ? width : -width}px,0,0)`;
      }

      setTimeout(cleanup,230);

      return;
    }

    /*
      Selesaikan perpindahan.
    */
    movingParts.forEach(el => {
      el.style.transition =
        'transform .18s cubic-bezier(.22,.8,.25,1)';
    });

    setTransform(
      `translate3d(${direction < 0 ? -width : width}px,0,0)`
    );

    nextPage.style.transition =
      'transform .18s cubic-bezier(.22,.8,.25,1)';

    nextPage.style.transform =
      'translate3d(0,0,0)';

    setTimeout(function(){

      const targetPage = pages[nextIndex];

      /*
        showPage tetap dipakai supaya sistem navigasi
        lama tidak rusak.
      */
      showPage(targetPage);

      cleanup();

    },190);
  }

  app.addEventListener('touchstart', function(e){

    if(!e.touches.length) return;

    const active = getActive();

    if(!active) return;

    const target = e.target;

    /*
      Reader dan modal punya gesture sendiri.
    */
    if(
      target.closest('.reader') ||
      target.closest('.modal') ||
      target.closest('input')
    ){
      return;
    }

    /*
      HOME:
      Cover "Lanjutkan membaca" dikecualikan.
      Carousel rekomendasi juga dikecualikan.
    */
    if(active.id === 'home'){

      if(
        target.closest('.continue-book') ||
        target.closest('.horizontal')
      ){
        return;
      }
    }

    /*
      Library:
      CARD BUKU TIDAK DI-BLOCK.
      Kita bedakan TAP vs SWIPE saat touchmove.
    */

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;

    currentPage = active;

    dragging = true;
    horizontal = false;
    movedEnough = false;

  }, {passive:true});


  app.addEventListener('touchmove', function(e){

    if(!dragging || !e.touches.length) return;

    currentX = e.touches[0].clientX;

    const currentY = e.touches[0].clientY;

    const dx = currentX - startX;
    const dy = currentY - startY;

    /*
      Tunggu sampai arah gesture cukup jelas.
    */
    if(!horizontal){

      if(
        Math.abs(dx) < 8 &&
        Math.abs(dy) < 8
      ){
        return;
      }

      /*
        Gesture vertikal:
        biarkan browser melakukan scroll normal.
      */
      if(Math.abs(dy) > Math.abs(dx) * 1.15){

        dragging = false;
        horizontal = false;

        return;
      }

      /*
        Gesture horizontal.
      */
      if(Math.abs(dx) > Math.abs(dy)){

        /*
          Cover Home dan carousel sudah dikecualikan
          sejak touchstart.
        */
        horizontal = true;
        movedEnough = true;

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

    cleanup();

  }, {passive:true});


})();
