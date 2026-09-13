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
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input',(e)=>{
  const q=e.target.value.trim().toLowerCase();

  let box = document.getElementById('searchSuggestions');

  if(!box){
    box = document.createElement('div');
    box.id = 'searchSuggestions';
    searchInput.closest('.search').appendChild(box);
  }

  if(!q){
    box.innerHTML = '';
    box.style.display = 'none';
    return;
  }

  const results = RuangBacaUIBooks.filter(b =>
    (b.title + ' ' + b.author)
      .toLowerCase()
      .includes(q)
  );

  box.innerHTML = results.length
    ? results.slice(0,6).map((b,i)=>`
        <button class="search-suggestion" data-index="${RuangBacaUIBooks.indexOf(b)}">
          <div class="suggestion-cover ${b.className}">
            <b>${b.title.charAt(0)}</b>
          </div>
          <div class="suggestion-info">
            <strong>${b.title}</strong>
            <small>${b.author}</small>
          </div>
        </button>
      `).join('')
    : `<div class="search-empty">Buku tidak ditemukan</div>`;

  box.style.display = 'block';
});

document.addEventListener('click',(e)=>{
  const item = e.target.closest('.search-suggestion');
  if(!item) return;

  const book = RuangBacaUIBooks[
    Number(item.dataset.index)
  ];

  if(!book) return;

  document.getElementById('searchSuggestions').style.display = 'none';
  searchInput.blur();

  showPage('library');
  renderBooks([book]);
});
