let products = [];
let filteredProducts = [];

// 🧱 Создание карточки товара
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const media = product.видео
    ? `<iframe width="100%" height="180" src="https://rutube.ru/play/embed/${product.видео}" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe>`
    : `<img src="${product.фото}" alt="${product.название}" />`;

  card.innerHTML = `
    ${media}
    <h3>${product.название || 'Без названия'}</h3>
    ${product.описание ? `<p>${product.описание}</p>` : ''}
    <strong>${product.цена} ₽</strong>
    <div class="card-buttons">
      <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
      <button class="fav-btn" onclick="toggleFavorite('${product.название}')">⭐</button>
    </div>
  `;

  return card;
}

// 🖼 Отображение
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

// 🧠 Фильтрация
function filterProducts() {
  const getVal = id => (document.getElementById(id)?.value || '').toLowerCase();
  const priceMin = parseFloat(document.getElementById('filter-price-min')?.value) || 0;
  const priceMax = parseFloat(document.getElementById('filter-price-max')?.value) || Infinity;
  const search = getVal('searchInput');

  filteredProducts = products.filter(p => {
    const fields = {
      category: (p.категория || '').toLowerCase(),
      subcategory: (p.подкатегория || '').toLowerCase(),
      subsubcategory: (p.подподкатегория || '').toLowerCase(),
      brand: (p.бренд || '').toLowerCase(),
      country: (p.страна || '').toLowerCase(),
      type: (p.тип || '').toLowerCase(),
      name: (p.название || '').toLowerCase(),
      description: (p.описание || '').toLowerCase(),
      price: parseFloat(p.цена) || 0
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

// 🧩 Заполнение фильтров
function updateFilters() {
  const fields = {
    'filter-category': 'категория',
    'filter-subcategory': 'подкатегория',
    'filter-subsubcategory': 'подподкатегория',
    'filter-brand': 'бренд',
    'filter-country': 'страна',
    'filter-type': 'тип'
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

// 🔍 Автозаполнение
function setupAutocomplete() {
  const list = document.getElementById('autocompleteList');
  if (!list) return;
  list.innerHTML = '';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.название;
    list.appendChild(opt);
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

// 🧠 Обработчики
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

// 🚀 Загрузка товаров
async function loadProducts() {
  try {
    const res = await fetch(url);
    const data = await res.json();

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
      type: p.тип
    }));

    products.reverse(); // Новые вверху
    updateFilters();
    setupAutocomplete();
    setupEvents();
    filterProducts(); // Показываем всё сразу
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    document.getElementById('product-list').innerHTML = '<p>Ошибка загрузки товаров.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
