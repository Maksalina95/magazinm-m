// product.js

document.addEventListener("DOMContentLoaded", () => {
  const productListEl = document.getElementById('product-list');
  const modal = createModal();
  document.body.appendChild(modal);

  // Подгрузка товаров из Google Таблицы (TSV)
  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRWJ_CpYRd1TvS3NWbto7jEZ2VPBe2zORR1U3_dCkRxo_3ao7hptKeEfZrnILQID9y_ex8UDRSStvP-/pub?output=tsv')
    .then(res => res.text())
    .then(text => parseTSV(text))
    .then(data => {
      showProducts(data);
      setupProductClicks(data);
    });

  function parseTSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t');
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
      return obj;
    });
  }

  function showProducts(list) {
    productListEl.innerHTML = '';
    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'product-card';
      el.setAttribute('data-name', item.название);

      el.innerHTML = `
        ${item.видео 
          ? <video controls src="${item.видео}"></video> 
          : <img src="${item.фото}" alt="${item.название}" />}
        <h3>${item.название}</h3>
        <strong>${item.цена} ₽</strong>
        <div class="card-buttons">
          <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
          <button class="fav-btn" onclick="toggleFavorite('${item.название}', event)">⭐</button>
        </div>
      `;
      productListEl.appendChild(el);
    });
  }

  function setupProductClicks(data) {
    productListEl.addEventListener('click', e => {
      // Игнорируем клики по кнопке избранного и ссылке WhatsApp
      if (e.target.closest('.fav-btn') || e.target.closest('a')) return;

      let card = e.target.closest('.product-card');
      if (!card) return;

      const productName = card.getAttribute('data-name');
      const product = data.find(p => p.название === productName);
      if (!product) return;

      openModal(product);
    });
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'product-modal';
    modal.style.cssText = `
      position: fixed;
      top:0; left:0; right:0; bottom:0;
      background: rgba(0,0,0,0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="
        background: #fff;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        padding: 20px;
      ">
        <button id="modal-close" style="
          position: absolute; 
          top: 10px; 
          right: 10px; 
          font-size: 20px; 
          background: none; 
          border: none; 
          cursor: pointer;
          color: #a63b3b;
        ">&times;</button>
        <div id="modal-content"></div>
      </div>
    `;

    modal.querySelector('#modal-close').onclick = () => {
      modal.style.display = 'none';
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };

    return modal;
  }

  function openModal(product) {
    const modal = document.getElementById('product-modal');
    const content = modal.querySelector('#modal-content');

    content.innerHTML = `
      ${product.видео 
        ? <video controls src="${product.видео}" style="width: 100%; border-radius: 12px;"></video> 
        : <img src="${product.фото}" alt="${product.название}" style="width: 100%; border-radius: 12px;" />}
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
    `;

    modal.style.display = 'flex';
  }

  window.toggleFavorite = function(name, event) {
    event.stopPropagation(); // чтобы не открывалась карточка при клике на звёздочку
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favs.includes(name)) {
      favs = favs.filter(n => n !== name);
    } else {
      favs.push(name);
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    // Можно добавить визуальную смену цвета кнопки
    event.target.classList.toggle('active');
  };
});
