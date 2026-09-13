function renderBooks(list){
  const grid=document.getElementById('libraryGrid');
  grid.innerHTML=list.map(b=>`
    <button class="card" data-action="reader">
      <div class="cover ${b.className}"><b>${b.title}</b></div>
      <div class="card-title">${b.title}</div>
      <div class="card-author">${b.author}</div>
    </button>`).join('');
  grid.querySelectorAll('[data-action="reader"]').forEach(x=>x.addEventListener('click',openReader));
}
function filtered(type){
  if(type==='favorite') return RuangBacaUIBooks.filter(b=>b.favorite);
  if(type==='reading') return RuangBacaUIBooks.filter(b=>b.status==='reading');
  if(type==='done') return RuangBacaUIBooks.filter(b=>b.status==='done');
  return RuangBacaUIBooks;
}
function renderRecommendations(){
  document.getElementById('recommendations').innerHTML=RuangBacaUIBooks.slice(0,5).map(b=>`
    <button class="reco" data-action="reader">
      <div class="cover ${b.className}"><b>${b.title}</b></div>
      <div class="reco-title">${b.title}</div><div class="reco-author">${b.author}</div>
    </button>`).join('');
  document.querySelectorAll('.reco[data-action="reader"]').forEach(x=>x.addEventListener('click',openReader));
}
renderBooks(RuangBacaUIBooks); renderRecommendations();

document.getElementById('libraryFilters').addEventListener('click',(e)=>{
  const btn=e.target.closest('.chip'); if(!btn)return;
  document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); renderBooks(filtered(btn.dataset.filter));
});
document.getElementById('searchInput').addEventListener('input',(e)=>{
  const q=e.target.value.trim().toLowerCase();
  if(!q)return;
  showPage('library');
  renderBooks(RuangBacaUIBooks.filter(b=>(b.title+' '+b.author).toLowerCase().includes(q)));
});

