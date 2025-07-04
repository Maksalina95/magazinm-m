// favorites.js

let allProducts = [];
let currentProductIndex = null;

document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById('favorites-list');
  const modal = document.getElementById('product-modal');
  const modalContent = modal.querySelector('#modal-content');

  // Загружаем избранные из localStorage
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (!favs.length) {
    productList.innerHTML = '<p>У вас пока нет избранных товаров.</p>';
    return;
  }

  // Загружаем все товары из таблицы (через config.js)
  fetch(`${baseUrl}/Sheet1`)
    .then(res => res.json())
    .then(data => {
      // Фильтруем по избранным
      allProducts = data.filter(p => favs.includes(p.название) && p.фото);
      if (allProducts.length === 0) {
        productList.innerHTML = '<p>У вас пока нет избранных товаров.</p>';
        return;
      }
      renderProducts(allProducts);
    })
    .catch(err => {
      console.error('Ошибка загрузки товаров:', err);
      productList.innerHTML = '<p>Ошибка загрузки товаров.</p>';
    });

  function renderProducts(products) {
    productList.innerHTML = '';
    products.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.setAttribute('data-index', index);
      card.innerHTML = `
        ${item.видео 
          ? `<video src="${item.видео}" controls></video>` 
          : `<img src="${item.фото}" alt="${item.название}" />`}
        <h3>${item.название}</h3>
        <strong>${item.цена} ₽</strong>
        <div class="card-buttons">
          <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
          <button class="fav-btn active" onclick="toggleFavorite('${item.название}', event)">⭐</button>
        </div>
      `;
      card.addEventListener('click', e => {
        if (e.target.closest('.fav-btn') || e.target.closest('a')) return;
        currentProductIndex = index;
        openModal(allProducts[currentProductIndex]);
      });
      productList.appendChild(card);
    });
  }

  function openModal(product) {
    modalContent.innerHTML = `
      ${product.видео 
        ? `<video src="${product.видео}" controls style="width: 100%; border-radius: 12px;"></video>` 
        : `<img src="${product.фото}" alt="${product.название}" style="width: 100%; border-radius: 12px;" />`}
      <h2 style="color:#a63b3b; margin-top: 15px;">${product.название}</h2>
      <p style="white-space: pre-line; color:#5a2e2e;">${product.описание || ''}</p>
      <strong style="font-size: 20px; display:block; margin-top: 10px;">${product.цена} ₽</strong>
      <a href="https://wa.me/79376280080" target="_blank" style="
        display: inline-block;
        background: #25D366;
        color: white;
        padding: 10px 16px;
        border-radius: 8px;
        text-decoration: none;
        margin-top: 10px;
      ">Связаться в WhatsApp</a>
      <div style="margin-top:20px; display:flex; justify-content:space-between;">
        <button onclick="showPrevProduct()" style="background:#f0f0f0; border:none; padding:8px 12px;">← Назад</button>
        <button onclick="showNextProduct()" style="background:#f0f0f0; border:none; padding:8px 12px;">Вперёд →</button>
      </div>
    `;
    modal.style.display = 'flex';
  }

  window.toggleFavorite = function(name, event) {
    event.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favs.includes(name)) {
      favs = favs.filter(n => n !== name);
    } else {
      favs.push(name);
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    // Перерисуем страницу, чтобы обновить статус звездочек
    allProducts = allProducts.filter(p => favs.includes(p.название));
    renderProducts(allProducts);
    modal.style.display = 'none';
  };

  window.showNextProduct = function () {
    if (currentProductIndex === null || currentProductIndex >= allProducts.length - 1) return;
    currentProductIndex++;
    openModal(allProducts[currentProductIndex]);
  };

  window.showPrevProduct = function () {
    if (currentProductIndex === null || currentProductIndex <= 0) return;
    currentProductIndex--;
    openModal(allProducts[currentProductIndex]);
  };

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});
