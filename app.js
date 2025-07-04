// 📦 Настройки подключения к Google Таблице через OpenSheet
const sheetId = '2PACX-1vRWJ_CpYRd1TvS3NWbto7jEZ2VPBe2zORR1U3_dCkRxo_3ao7hptKeEfZrnILQID9y_ex8UDRSStvP-';
const baseUrl = https://opensheet.elk.sh/${sheetId}/Sheet1; // Или Sheet1List — если у тебя другой лист

const productList = document.getElementById('product-list');
const categoryGallery = document.getElementById('category-gallery');
const filters = document.getElementById('filters');
const searchInput = document.getElementById('searchInput');
const autoList = document.getElementById('autocompleteList');

let productsData = [];

// 📥 Загрузка данных
fetch(baseUrl)
  .then(res => res.json())
  .then(data => {
    productsData = data.filter(item => item.фото && item.название && item.цена);

    renderCategories();
    setupAutocomplete();
    setupSearchHandler();
    updateFilters(productsData);
    setupFilterHandlers();
  })
  .catch(err => {
    if (productList) productList.innerHTML = '<p>Ошибка загрузки товаров.</p>';
    console.error(err);
  });

// 🧱 Показ товаров
function showProducts(list) {
  if (!productList) return;
  productList.innerHTML = '';

  list.forEach(item => {
    const el = document.createElement('div');
    el.className = 'product-card';

    el.innerHTML = `
      ${item.видео 
        ? <video controls src="${item.видео}"></video> 
        : <img src="${item.фото}" alt="${item.название}" />}
      <h3>${item.название}</h3>
      ${item.описание ? <p>${item.описание}</p> : ''}
      <strong>${item.цена} ₽</strong>
      <div class="card-buttons">
        <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
        <button class="fav-btn" onclick="toggleFavorite('${item.название}')">⭐</button>
      </div>
    `;
    productList.appendChild(el);
  });
}

// 📁 Категории
function renderCategories() {
  if (!categoryGallery) return;
  const categories = {};

  productsData.forEach(item => {
    const cat = item.категория;
    if (cat && !categories[cat]) {
      categories[cat] = item['картинка категории'] || item.фото;
    }
  });

  categoryGallery.innerHTML = '';

  Object.entries(categories).forEach(([name, image]) => {
    const tile = document.createElement('div');
    tile.className = 'category-tile';
    tile.innerHTML = `
      <a href="#" onclick="filterByCategory('${name}')">
        <img src="${image}" alt="${name}" />
        <span>${name}</span>
      </a>
    `;
    categoryGallery.appendChild(tile);
  });
}

function filterByCategory(cat) {
  const filtered = productsData.filter(p => p.категория === cat);
  if (filters) filters.style.display = 'flex';
  if (categoryGallery) categoryGallery.style.display = 'none';
  if (productList) productList.style.display = 'grid';
  showProducts(filtered);
}

// 🔍 Поиск
function setupSearchHandler() {
  if (!searchInput) return;
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const result = productsData.filter(p => p.название.toLowerCase().includes(term));

    filters.style.display = term ? 'flex' : 'none';
    categoryGallery.style.display = term ? 'none' : 'grid';
    productList.style.display = term ? 'grid' : 'none';

    showProducts(result);
  });
}

// 💡 Автозаполнение
function setupAutocomplete() {
  if (!autoList) return;
  autoList.innerHTML = '';
  productsData.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.название;
    autoList.appendChild(opt);
  });
}

// 🎯 Фильтры
const filterSelects = document.querySelectorAll('#filters select, #filters input[type=number]');
filterSelects.forEach(sel => sel.addEventListener('input', applyFilters));

function applyFilters() {
  let result = [...productsData];

  filterSelects.forEach(sel => {
    const id = sel.id.replace('filter-', '');
    const val = sel.value.toLowerCase();
    if (val && val !== 'все') {
      result = result.filter(p => (p[id] || '').toLowerCase().includes(val));
    }
  });

  const min = parseFloat(document.getElementById('filter-price-min')?.value || 0);
  const max = parseFloat(document.getElementById('filter-price-max')?.value || 999999);

  result = result.filter(p => {
    const price = parseFloat(p.цена);
    return !isNaN(price) && price >= min && price <= max;
  });

  showProducts(result);
}

// 🔄 Заполнение фильтров
function updateFilters(data) {
  const fields = ['категория', 'подкатегория', 'раздел', 'бренд', 'страна', 'тип'];
  fields.forEach(field => {
    const select = document.getElementById(filter-${field});
    if (!select) return;
    const values = [...new Set(data.map(item => item[field]).filter(Boolean))];
    values.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });
  });
}

// ⭐ Избранное
function toggleFavorite(name) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(name)) {
    favs = favs.filter(n => n !== name);
  } else {
    favs.push(name);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
}
