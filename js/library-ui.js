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
const searchWrap = searchInput.closest('.search');

let searchSuggestions = document.getElementById('searchSuggestions');

if(!searchSuggestions){
  searchSuggestions = document.createElement('div');
  searchSuggestions.id = 'searchSuggestions';
  document.body.appendChild(searchSuggestions);
}

function positionSearchSuggestions(){
  const rect = searchInput.closest('.search').getBoundingClientRect();

  searchSuggestions.style.position = 'fixed';
  searchSuggestions.style.left = rect.left + 'px';
  searchSuggestions.style.top = (rect.bottom + 8) + 'px';
  searchSuggestions.style.width = rect.width + 'px';
}

function getSearchResults(q){
  const query = q.toLowerCase().trim();

  return RuangBacaUIBooks
    .map((book,index)=>{
      const title = book.title.toLowerCase();
      const author = book.author.toLowerCase();

      let score = 0;

      if(title === query) score += 100;
      if(title.startsWith(query)) score += 50;
      if(title.includes(query)) score += 30;
      if(author.includes(query)) score += 20;

      return {book,index,score};
    })
    .filter(x=>x.score > 0)
    .sort((a,b)=>b.score-a.score);
}

function hideSearchSuggestions(){
  searchSuggestions.classList.remove('show');
}

function showSearchSuggestions(results){
positionSearchSuggestions();
  
  if(!results.length){
    searchSuggestions.innerHTML = `
      <div class="search-empty">
        Tidak ada buku yang cocok
      </div>
    `;

    searchSuggestions.classList.add('show');
    return;
  }

  searchSuggestions.innerHTML = results
    .slice(0,6)
    .map(({book,index})=>`
      <button
        type="button"
        class="search-suggestion"
        data-index="${index}"
      >
        <div class="suggestion-cover ${book.className}">
          <b>${book.title.charAt(0)}</b>
        </div>

        <div class="suggestion-info">
          <strong>${book.title}</strong>
          <small>${book.author}</small>
        </div>

        <span class="suggestion-arrow">›</span>
      </button>
    `)
    .join('');

  searchSuggestions.classList.add('show');
}

searchInput.addEventListener('input',(e)=>{

  const q = e.target.value.trim();

  if(!q){
    hideSearchSuggestions();
    return;
  }

  const results = getSearchResults(q);

  showSearchSuggestions(results);
});


searchSuggestions.addEventListener('click',(e)=>{

  const item = e.target.closest('.search-suggestion');

  if(!item) return;

  const index = Number(item.dataset.index);
  const book = RuangBacaUIBooks[index];

  if(!book) return;

  searchInput.value = book.title;
  hideSearchSuggestions();
  searchInput.blur();

  showPage('library');
  renderBooks([book]);
});


document.addEventListener('click',(e)=>{

  if(!searchWrap.contains(e.target)){
    hideSearchSuggestions();
  }

});


searchInput.addEventListener('keydown',(e)=>{

  if(e.key !== 'Enter') return;

  const q = searchInput.value.trim();

  if(!q) return;

  const results = getSearchResults(q);

  hideSearchSuggestions();

  showPage('library');

  renderBooks(
    results.map(x=>x.book)
  );

});
