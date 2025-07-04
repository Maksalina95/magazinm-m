// app.js

let products = [];
let filteredProducts = [];
let currentIndex = null;

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// Загрузка товаров из Google Таблицы
async function loadProducts() {
  try {
    const res = await fetch(${baseUrl}/Sheet1);
    const data = await res.json();

    products = data.filter(p => p.название && (p.фото || p.видео));
    products.reverse();

    updateFilters();
    setupAutocomplete();
    setupEvents();
    filterProducts();
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    document.getElementById('product-list').innerHTML = '<p>Ошибка загрузки товаров.</p>';
  }
}

// Создание карточки товара
function createProductCard(p, index) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-index', index);

  const media = p.видео?.includes('rutube.ru')
    ? <iframe width="100%" height="180" src="${p.видео}" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe>
    : <img src="${p.фото}" alt="${p.название}" loading="lazy" />;

  card.innerHTML = `
    ${media}
    <h3>${p.название}</h3>
    ${p.описание ? <p>${p.описание}</p> : ''}
    <strong>${p.цена} ₽</strong>
    <div class="card-buttons">
      <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
      <button class="fav-btn" onclick="toggleFavorite('${p.название}', event)">⭐</button>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.closest('a') || e.target.closest('.fav-btn')) return;
    currentIndex = index;
    openModal(products[currentIndex]);
  });

  return card;
}

// Отображение товаров
function renderProducts(list) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<p>Товары не найдены.</p>';
    return;
  }

  list.forEach((p, i) => {
    const card = createProductCard(p, i);
    container.appendChild(card);
  });
}

// Фильтрация
function filterProducts() {
  const getVal = id => (document.getElementById(id)?.value || '').toLowerCase();
  const priceMin = parseFloat(document.getElementById('filter-price-min')?.value) || 0;
  const priceMax = parseFloat(document.getElementById('filter-price-max')?.value) || Infinity;
  const search = getVal('searchInput');

  filteredProducts = products.filter(p => {
    const f = {
      category: (p.категория || '').toLowerCase(),
      subcategory: (p.подкатегория || '').toLowerCase(),
      subsubcategory: (p.подподкатегория || '').toLowerCase(),
      brand: (p.бренд || '').toLowerCase(),
      country: (p.страна || '').toLowerCase(),
      type: (p.тип || '').toLowerCase(),
      name: (p.название || '').toLowerCase(),
      desc: (p.описание || '').toLowerCase(),
      price: parseFloat(p.цена) || 0
    };

    if (getVal('filter-category') && f.category !== getVal('filter-category')) return false;
    if (getVal('filter-subcategory') && f.subcategory !== getVal('filter-subcategory')) return false;
    if (getVal('filter-subsubcategory') && f.subsubcategory !== getVal('filter-subsubcategory')) return false;
    if (getVal('filter-brand') && f.brand !== getVal('filter-brand')) return false;
    if (getVal('filter-country') && f.country !== getVal('filter-country')) return false;
    if (getVal('filter-type') && f.type !== getVal('filter-type')) return false;
    if (f.price < priceMin || f.price > priceMax) return false;
    if (search && !f.name.includes(search) && !f.desc.includes(search)) return false;

    return true;
  });

  renderProducts(filteredProducts);
}

// Обновление фильтров
function updateFilters() {
  const fields = {
    'filter-category': 'категория',
    'filter-subcategory': 'подкатегория',
    'filter-subsubcategory': 'подподкатегория',
    'filter-brand': 'бренд',
    'filter-country': 'страна',
    'filter-type': 'тип'
  };

  Object.entries(fields).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="">Все</option>';
    const values = [...new Set(products.map(p => p[key]).filter(Boolean))].sort();
    values.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      el.appendChild(opt);
    });
  });
}

// Автозаполнение
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

// Обработчики фильтров
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

// Избранное
function toggleFavorite(name, e) {
  e.stopPropagation();
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(name)) {
    favs = favs.filter(n => n !== name);
  } else {
    favs.push(name);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
  e.target.classList.toggle('active');
}

// Модалка
function openModal(product) {
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');

  const media = product.видео?.includes('rutube.ru')
    ? <iframe width="100%" height="200" src="${product.видео}" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe>
    : <img src="${product.фото}" alt="${product.название}" style="width:100%; border-radius:12px;" />;

  content.innerHTML = `
    ${media}
    <h2 style="color:#a63b3b">${product.название}</h2>
    <p style="white-space: pre-line;">${product.описание || ''}</p>
    <strong style="font-size:18px;">${product.цена} ₽</strong>
    <br/><br/>
    <a href="https://wa.me/79376280080" class="buy-button" target="_blank">Связаться в WhatsApp</a>
    <div style="margin-top:20px; display:flex; justify-content:space-between;">
      <button onclick="showPrevProduct()">← Назад</button>
      <button onclick="showNextProduct()">Вперёд →</button>
    </div>
  `;

  modal.style.display = 'flex';
}

// Переключение товаров в модалке
function showNextProduct() {
  if (currentIndex < products.length - 1) {
    currentIndex++;
    openModal(products[currentIndex]);
  }
}
function showPrevProduct() {
  if (currentIndex > 0) {
    currentIndex--;
    openModal(products[currentIndex]);
  }
}

// Закрытие модалки по клику вне окна
document.addEventListener('click', e => {
  const modal = document.getElementById('product-modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
