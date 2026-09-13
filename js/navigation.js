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
   RuangBaca v2 — READER Aa + SWIPE PATCH
   PATCH ONLY — kode lama tetap dipertahankan
   ========================================================= */

/* Reader Aa: normal -> besar -> ekstra besar -> normal */
(function(){
  const aa = $('#reader .readerbar > div .rbtn:last-child');
  const reader = $('#reader');

  if(!aa || !reader) return;

  const sizes = [
    'rb-size-normal',
    'rb-size-large',
    'rb-size-xl'
  ];

  let index = 0;

  reader.classList.add(sizes[index]);

  aa.addEventListener('click', function(){
    reader.classList.remove(...sizes);

    index = (index + 1) % sizes.length;
    reader.classList.add(sizes[index]);
  });
})();

/* Swipe Home <-> Library */
(function(){
  let startX = 0;
  let startY = 0;

  document.addEventListener('touchstart', function(e){
    if(!e.touches.length) return;

    const target = e.target;

    if(target.closest('input, button, .horizontal, .chips, .reader, .modal')){
      return;
    }

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, {passive:true});

  document.addEventListener('touchend', function(e){
    if(!e.changedTouches.length) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;

    if(
      Math.abs(dx) < 70 ||
      Math.abs(dx) < Math.abs(dy) * 1.35
    ){
      return;
    }

    const active = $('.page.active');
    if(!active) return;

    if(active.id === 'home' && dx < 0){
      showPage('library');
    }

    if(active.id === 'library' && dx > 0){
      showPage('home');
    }
  }, {passive:true});
})();
