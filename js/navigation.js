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
   RuangBaca v2.4 — SIDE BY SIDE NATIVE PAGER
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

  let startIndex = 0;
  let targetIndex = 0;

  let dragging = false;
  let horizontal = false;
  let swipeDetected = false;

  let raf = 0;

  function getIndex(){
    const active = document.querySelector('.page.active');
    if(!active) return 0;

    const index = pages.indexOf(active.id);
    return index < 0 ? 0 : index;
  }

  function getWidth(){
    return app.clientWidth || window.innerWidth;
  }

  function setMove(index, extraX = 0){

    const width = getWidth();

    const base = -(index * width);
    const value = base + extraX;

    movingParts.forEach(el => {

      if(el === main){

        el.style.transform =
          `translate3d(${value}px,0,0)`;

      }else if(el === bottom){

        el.style.transform =
          `translateX(-50%) translate3d(${value}px,0,0)`;

      }else{

        el.style.transform =
          `translate3d(${value}px,0,0)`;
      }

    });
  }

  function clearTransition(){

    movingParts.forEach(el => {
      el.style.transition = '';
      el.style.willChange = '';
    });
  }

  function setTransition(duration){

    movingParts.forEach(el => {

      el.style.transition =
        `transform ${duration}ms cubic-bezier(.22,.8,.25,1)`;

      el.style.willChange = 'transform';
    });
  }

  function syncToPage(page, animate = true){

    const index = pages.indexOf(page);

    if(index < 0) return;

    targetIndex = index;

    if(animate){

      setTransition(220);
      setMove(index);

      setTimeout(clearTransition,240);

    }else{

      clearTransition();
      setMove(index);
    }
  }

  /*
    Bungkus showPage lama.

    Semua fungsi lama yang memanggil showPage()
    tetap bekerja, tetapi sekarang posisi layar
    ikut berpindah ke halaman yang benar.
  */

  const originalShowPage = showPage;

  showPage = function(page){

    originalShowPage(page);

    syncToPage(page,true);
  };

  /*
    Posisi awal.
  */

  syncToPage(pages[getIndex()],false);

  /*
    Touch Start
  */

  app.addEventListener('touchstart',function(e){

    if(!e.touches.length) return;

    const target = e.target;

    /*
      Jangan ganggu reader, modal, input,
      bottom navigation dan FAB.
    */

    if(
      target.closest('.reader') ||
      target.closest('.modal') ||
      target.closest('input') ||
      target.closest('.bottom') ||
      target.closest('.fab')
    ){
      return;
    }

    /*
      Home:
      cover lanjut membaca dan carousel
      tetap punya gesture sendiri.
    */

    const active = document.querySelector('.page.active');

    if(active && active.id === 'home'){

      if(
        target.closest('.continue-book') ||
        target.closest('.horizontal')
      ){
        return;
      }
    }

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;

    startIndex = getIndex();
    targetIndex = startIndex;

    dragging = true;
    horizontal = false;
    swipeDetected = false;

  },{passive:true});


  /*
    Touch Move
  */

  app.addEventListener('touchmove',function(e){

    if(!dragging || !e.touches.length) return;

    currentX = e.touches[0].clientX;

    const currentY = e.touches[0].clientY;

    const dx = currentX - startX;
    const dy = currentY - startY;

    /*
      Tentukan arah gesture.
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
        jangan ganggu scroll normal.
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

        horizontal = true;
        swipeDetected = true;

        targetIndex =
          dx < 0
            ? startIndex + 1
            : startIndex - 1;

        /*
          Jangan melewati Home/Profile.
        */

        if(
          targetIndex < 0 ||
          targetIndex >= pages.length
        ){
          targetIndex = startIndex;
        }

        requestUpdate();
      }

      return;
    }

    requestUpdate();

  },{passive:true});


  function requestUpdate(){

    if(!raf){

      raf =
        requestAnimationFrame(update);
    }
  }


  function update(){

    raf = 0;

    if(!dragging || !horizontal) return;

    const width = getWidth();

    const distance =
      currentX - startX;

    /*
      Jika berada di ujung,
      beri resistance.
    */

    if(targetIndex === startIndex){

      const resisted =
        distance * 0.22;

      setMove(startIndex,resisted);

      return;
    }

    /*
      Halaman aktif dan halaman sebelahnya
      bergerak bersamaan.

      Tidak ada halaman yang ditumpuk.
    */

    setMove(startIndex,distance);
  }


  /*
    Touch End
  */

  app.addEventListener('touchend',function(){

    if(!dragging){

      return;
    }

    dragging = false;

    if(!horizontal){

      return;
    }

    const width = getWidth();

    const distance =
      currentX - startX;

    const threshold =
      Math.max(42,width * 0.18);

    const passed =
      Math.abs(distance) >= threshold &&
      targetIndex !== startIndex;

    /*
      Tidak cukup jauh:
      kembali ke halaman awal.
    */

    if(!passed){

      setTransition(220);
      setMove(startIndex);

      setTimeout(clearTransition,240);

      return;
    }

    /*
      Swipe berhasil:
      halaman sebelah benar-benar menyelesaikan
      pergerakannya sampai memenuhi layar.
    */

    const direction =
      targetIndex > startIndex ? -1 : 1;

    const remaining =
      width - Math.abs(distance);

    setTransition(
      Math.max(
        150,
        Math.min(230,remaining * 0.65)
      )
    );

    setMove(targetIndex);

    /*
      Update halaman aktif setelah animasi selesai.
    */

    setTimeout(function(){

      const targetPage =
        pages[targetIndex];

      originalShowPage(targetPage);

      clearTransition();

      setMove(targetIndex);

    },190);

  },{passive:true});


  /*
    Touch Cancel
  */

  app.addEventListener('touchcancel',function(){

    dragging = false;
    horizontal = false;

    setTransition(180);
    setMove(startIndex);

    setTimeout(clearTransition,200);

  },{passive:true});


  /*
    Setelah swipe pada kartu buku,
    jangan sampai dianggap sebagai TAP.
  */

  let suppressClickUntil = 0;

  app.addEventListener('touchend',function(){

    if(swipeDetected){

      suppressClickUntil =
        Date.now() + 350;
    }

    swipeDetected = false;

  },true);


  app.addEventListener('click',function(e){

    if(Date.now() < suppressClickUntil){

      e.preventDefault();
      e.stopPropagation();

      suppressClickUntil = 0;
    }

  },true);


  /*
    Kalau ukuran layar berubah,
    posisi halaman tetap benar.
  */

  window.addEventListener('resize',function(){

    syncToPage(
      pages[getIndex()],
      false
    );

  });

})();
