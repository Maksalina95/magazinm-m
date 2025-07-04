// app.js

let products = [];
let filteredProducts = [];

// Создание карточки товара с поддержкой видео и фото
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const media = product.video
    ? <iframe width="100%" height="180" src="https://rutube.ru/play/embed/${product.video}" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe>
    : <img src="${product.photo}" alt="${product.name}" />;

  card.innerHTML = `
    ${media}
    <h3>${product.name || 'Без названия'}</h3>
    ${product.description ? <p>${product.description}</p> : ''}
    <strong>${product.price} ₽</strong>
    <div class="card-buttons">
      <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
      <button class="fav-btn" onclick="toggleFavorite('${product.name}')">⭐</button>
    </div>
  `;

  return card;
}

// Отображение товаров на странице
function renderProducts(list) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<p>Товары не найдены.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'product-grid';

  list.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// Фильтрация товаров по значениям фильтров и поиску
function filterProducts() {
  const getVal = id => (document.getElementById(id)?.value || '').toLowerCase();
  const priceMin = parseFloat(document.getElementById('filter-price-min')?.value) || 0;
  const priceMax = parseFloat(document.getElementById('filter-price-max')?.value) || Infinity;
  const search = getVal('searchInput');

  filteredProducts = products.filter(p => {
    const fields = {
      category: (p.category || '').toLowerCase(),
      subcategory: (p.subcategory || '').toLowerCase(),
      subsubcategory: (p.subsubcategory || '').toLowerCase(),
      brand: (p.brand || '').toLowerCase(),
      country: (p.country || '').toLowerCase(),
      type: (p.type || '').toLowerCase(),
      name: (p.name || '').toLowerCase(),
      description: (p.description || '').toLowerCase(),
      price: parseFloat(p.price) || 0
    };

    if (getVal('filter-category') && fields.category !== getVal('filter-category')) return false;
    if (getVal('filter-subcategory') && fields.subcategory !== getVal('filter-subcategory')) return false;
    if (getVal('filter-subsubcategory') && fields.subsubcategory !== getVal('filter-subsubcategory')) return false;
    if (getVal('filter-brand') && fields.brand !== getVal('filter-brand')) return false;
    if (getVal('filter-country') && fields.country !== getVal('filter-country')) return false;
    if (getVal('filter-type') && fields.type !== getVal('filter-type')) return false;
    if (fields.price < priceMin || fields.price > priceMax) return false;
    if (search && !fields.name.includes(search) && !fields.description.includes(search)) return false;

    return true;
  });

  renderProducts(filteredProducts);
}

// Заполнение фильтров уникальными значениями
function updateFilters() {
  const fields = {
    'filter-category': 'category',
    'filter-subcategory': 'subcategory',
    'filter-subsubcategory': 'subsubcategory',
    'filter-brand': 'brand',
    'filter-country': 'country',
    'filter-type': 'type'
  };

  Object.entries(fields).forEach(([selectId, fieldKey]) => {
    const select = document.getElementById(selectId);
    if (!select) return;
    const values = [...new Set(products.map(p => p[fieldKey]).filter(Boolean))].sort();
    values.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });
  });
}

// Настройка автозаполнения поиска
function setupAutocomplete() {
  const list = document.getElementById('autocompleteList');
  if (!list) return;
  list.innerHTML = '';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    list.appendChild(opt);
  });
}

// Управление "избранным"
function toggleFavorite(name) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(name)) {
    favs = favs.filter(n => n !== name);
  } else {
    favs.push(name);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
}

// Установка слушателей для фильтров и поиска
function setupEvents() {
  const fields = [
    'filter-category', 'filter-subcategory', 'filter-subsubcategory',
    'filter-brand', 'filter-country', 'filter-type',
    'filter-price-min', 'filter-price-max', 'searchInput'
  ];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', filterProducts);
      el.addEventListener('change', filterProducts);
    }
  });
}

// Загрузка данных из Google Таблицы
async function loadProducts() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    // Перевод полей из русского в англ.
    products = data.map(p => ({
      ...p,
      photo: p.фото,
      name: p.название,
      description: p.описание,
      price: p.цена,
      video: p.видео,
      category: p.категория,
      subcategory: p.подкатегория,
      subsubcategory: p.подподкатегория,
      brand: p.бренд,
      country: p.страна,
      type: p.тип,
    }));

    // Новые товары первыми
    products.reverse();

    updateFilters();
    setupAutocomplete();
    setupEvents();
    filterProducts();
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    document.getElementById('product-list').innerHTML = '<p>Ошибка загрузки товаров</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
