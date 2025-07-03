// 📦 Настройки Google Таблицы const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRWJ_CpYRd1TvS3NWbto7jEZ2VPBe2zORR1U3_dCkRxo_3ao7hptKeEfZrnILQID9y_ex8UDRSStvP-/pub?output=tsv';

const productListEl = document.getElementById('product-list'); const searchInputEl = document.getElementById('searchInput'); const autoListEl = document.getElementById('autocompleteList'); const filtersEl = document.getElementById('filters');

let productListData = [];

// 📥 Загрузка данных fetch(sheetUrl) .then(res => res.text()) .then(text => parseTSV(text)) .then(data => { productListData = data.filter(item => item.фото && item.название && item.цена); showProducts(productListData); setupAutocomplete(productListData); updateFilters(productListData); }) .catch(err => { if (productListEl) productListEl.innerHTML = '<p>Ошибка загрузки товаров.</p>'; console.error(err); });

// 📃 Преобразование TSV в массив объектов function parseTSV(text) { const lines = text.trim().split('\n'); const headers = lines[0].split('\t'); return lines.slice(1).map(line => { const values = line.split('\t'); const obj = {}; headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim()); return obj; }); }

// 🧱 Отображение товаров function showProducts(list) { if (!productListEl) return; productListEl.innerHTML = ''; list.forEach(item => { const el = document.createElement('div'); el.className = 'product-card';

el.innerHTML = `
  ${item.видео 
    ? <video controls src="${item.видео}"></video> 
    : `<img src="${item.фото}" alt="${item.название}" />`}
  <h3>${item.название}</h3>
  ${item.описание ? `<p>${item.описание}</p>` : ''}
  <strong>${item.цена} ₽</strong>
  <div class="card-buttons">
    <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
    <button class="fav-btn" onclick="toggleFavorite('${item.название}')">⭐</button>
  </div>
`;
productListEl.appendChild(el);

}); }

// 🔍 Поиск if (searchInputEl) { searchInputEl.addEventListener('input', () => { const term = searchInputEl.value.toLowerCase(); const filtered = productListData.filter(p => p.название.toLowerCase().includes(term)); filtersEl.style.display = term ? 'flex' : 'none'; showProducts(filtered); }); }

// 💡 Автозаполнение function setupAutocomplete(list) { if (!autoListEl) return; autoListEl.innerHTML = ''; list.forEach(p => { const opt = document.createElement('option'); opt.value = p.название; autoListEl.appendChild(opt); }); }

// 🎯 Фильтры const filterSelects = document.querySelectorAll('#filters select, #filters input[type=number]'); filterSelects.forEach(sel => sel.addEventListener('input', applyFilters));

function applyFilters() { let result = [...productListData]; filterSelects.forEach(sel => { const id = sel.id.replace('filter-', ''); const val = sel.value.toLowerCase(); if (val && val !== 'все') { result = result.filter(p => (p[id] || '').toLowerCase().includes(val)); } });

const min = parseFloat(document.getElementById('filter-price-min')?.value || 0); const max = parseFloat(document.getElementById('filter-price-max')?.value || 999999); result = result.filter(p => { const price = parseFloat(p.цена); return !isNaN(price) && price >= min && price <= max; });

showProducts(result); }

// 🔄 Обновление списка фильтров function updateFilters(data) { const fields = ['категория', 'подкатегория', 'раздел', 'бренд', 'страна', 'тип']; fields.forEach(field => { const select = document.getElementById(filter-${field}); if (!select) return; const unique = [...new Set(data.map(item => item[field]).filter(Boolean))]; unique.forEach(val => { const opt = document.createElement('option'); opt.value = val; opt.textContent = val; select.appendChild(opt); }); }); }

// ⭐ Избранное function toggleFavorite(name) { let favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (favs.includes(name)) { favs = favs.filter(n => n !== name); } else { favs.push(name); } localStorage.setItem('favorites', JSON.stringify(favs)); }
