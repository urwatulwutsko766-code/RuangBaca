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
   RuangBaca v2.1 — FULL PAGE SWIPE
   Beranda <-> Perpustakaan <-> Profil
   ========================================================= */

(function(){

  const pages = ['home','library','profile'];

  let startX = 0;
  let startY = 0;
  let tracking = false;

  document.addEventListener('touchstart', function(e){

    if(!e.touches.length) return;

    const target = e.target;

    /* Jangan ganggu input, tombol, carousel, filter,
       reader, atau modal */
    if(target.closest(
      'input, button, .horizontal, .chips, .reader, .modal'
    )){
      tracking = false;
      return;
    }

    const active = $('.page.active');

    if(!active) return;

    const currentIndex = pages.indexOf(active.id);

    if(currentIndex === -1) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    tracking = true;

  }, {passive:true});


  document.addEventListener('touchend', function(e){

    if(!tracking || !e.changedTouches.length){
      tracking = false;
      return;
    }

    tracking = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;

    /* Harus benar-benar swipe horizontal */
    if(
      Math.abs(dx) < 70 ||
      Math.abs(dx) < Math.abs(dy) * 1.3
    ){
      return;
    }

    const active = $('.page.active');

    if(!active) return;

    const currentIndex = pages.indexOf(active.id);

    if(currentIndex === -1) return;

    let nextIndex = currentIndex;

    /* Usap kiri */
    if(dx < 0 && currentIndex < pages.length - 1){
      nextIndex = currentIndex + 1;
    }

    /* Usap kanan */
    if(dx > 0 && currentIndex > 0){
      nextIndex = currentIndex - 1;
    }

    /* Tidak ada halaman berikutnya */
    if(nextIndex === currentIndex) return;

    const nextPage = pages[nextIndex];

    /* Tentukan arah animasi */
    if(nextIndex > currentIndex){
      document.body.classList.add('rb-swipe-left');
    }else{
      document.body.classList.add('rb-swipe-right');
    }

    showPage(nextPage);

    /* Hapus class setelah animasi selesai */
    setTimeout(function(){
      document.body.classList.remove(
        'rb-swipe-left',
        'rb-swipe-right'
      );
    }, 260);

  }, {passive:true});

})();
