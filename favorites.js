// favorites.js

document.addEventListener("DOMContentLoaded", () => {
  const favoritesList = document.getElementById('favorites-list');
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (!favs.length) {
    favoritesList.innerHTML = '<p>У вас пока нет избранных товаров.</p>';
    return;
  }

  fetch(`${baseUrl}/Sheet1`)
    .then(res => res.json())
    .then(data => {
      // Отфильтруем товары по избранным названиям
      const favoriteProducts = data.filter(product => favs.includes(product.название));
      renderFavorites(favoriteProducts);
    })
    .catch(err => {
      console.error('Ошибка загрузки избранных товаров:', err);
      favoritesList.innerHTML = '<p>Ошибка загрузки избранных товаров.</p>';
    });

  function renderFavorites(products) {
    if (!products.length) {
      favoritesList.innerHTML = '<p>У вас пока нет избранных товаров.</p>';
      return;
    }

    favoritesList.innerHTML = ''; // Очистить контейнер

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const media = product.видео?.includes('rutube.ru')
        ? `<iframe width="100%" height="180" src="${product.видео}" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe>`
        : `<img src="${product.фото}" alt="${product.название}" loading="lazy" />`;

      card.innerHTML = `
        ${media}
        <h3>${product.название}</h3>
        ${product.описание ? <p>${product.описание}</p> : ''}
        <strong>${product.цена} ₽</strong>
        <div class="card-buttons">
          <a href="https://wa.me/79376280080" target="_blank">WhatsApp</a>
          <button class="fav-btn" onclick="removeFavorite('${product.название}', event)">❌ Убрать</button>
        </div>
      `;

      favoritesList.appendChild(card);
    });
  }

  window.removeFavorite = function(name, event) {
    event.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    favs = favs.filter(n => n !== name);
    localStorage.setItem('favorites', JSON.stringify(favs));
    // Обновляем список
    location.reload();
  }
});
