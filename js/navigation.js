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
   RuangBaca v2.1 — FULL PAGE SWIPE FIX
   Beranda <-> Perpustakaan <-> Profil
   ========================================================= */

(function(){

  const pages = ['home','library','profile'];

  let startX = 0;
  let startY = 0;
  let tracking = false;

  const app = document.querySelector('.app');

  if(!app) return;

  app.addEventListener('touchstart', function(e){

    if(!e.touches.length) return;

    const target = e.target;

    /* Jangan ganggu elemen interaktif */
    if(
      target.closest('input') ||
      target.closest('button') ||
      target.closest('.horizontal') ||
      target.closest('.chips') ||
      target.closest('.reader') ||
      target.closest('.modal')
    ){
      tracking = false;
      return;
    }

    const active = $('.page.active');

    if(!active) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;

  }, {passive:true});


  app.addEventListener('touchend', function(e){

    if(!tracking || !e.changedTouches.length){
      tracking = false;
      return;
    }

    tracking = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;

    /* Pastikan gerakannya horizontal */
    if(
      Math.abs(dx) < 60 ||
      Math.abs(dx) < Math.abs(dy) * 1.2
    ){
      return;
    }

    const active = $('.page.active');

    if(!active) return;

    const currentIndex = pages.indexOf(active.id);

    if(currentIndex === -1) return;

    let nextIndex = currentIndex;

    /* Swipe kiri */
    if(dx < 0 && currentIndex < pages.length - 1){
      nextIndex = currentIndex + 1;
    }

    /* Swipe kanan */
    if(dx > 0 && currentIndex > 0){
      nextIndex = currentIndex - 1;
    }

    /* Sudah di halaman paling ujung */
    if(nextIndex === currentIndex) return;

    /* Tentukan arah animasi */
    if(nextIndex > currentIndex){
      document.body.classList.add('rb-swipe-left');
    }else{
      document.body.classList.add('rb-swipe-right');
    }

    showPage(pages[nextIndex]);

    setTimeout(function(){

      document.body.classList.remove(
        'rb-swipe-left',
        'rb-swipe-right'
      );

    }, 300);

  }, {passive:true});

})();
