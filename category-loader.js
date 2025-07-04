// category-loader.js

const categoryUrl = ${baseUrl}/Sheet1;

const catGallery = document.getElementById('category-gallery');
if (catGallery) {
  fetch(categoryUrl)
    .then(res => res.json())
    .then(data => {
      // Отбираем записи с категорией и картинкой категории
      const filtered = data.filter(item => item.категория && item['картинка категории']);

      // Собираем уникальные категории с картинками
      const categoriesMap = {};
      filtered.forEach(item => {
        if (!categoriesMap[item.категория]) {
          categoriesMap[item.категория] = item['картинка категории'];
        }
      });

      catGallery.innerHTML = '';

      // Создаём плитки категорий с ссылками на страницу с товарами по категории
      Object.entries(categoriesMap).forEach(([category, image]) => {
        const tile = document.createElement('div');
        tile.className = 'category-tile';
        tile.innerHTML = `
          <a href="category-products.html?category=${encodeURIComponent(category)}">
            <img src="${image}" alt="${category}" />
            <span>${category}</span>
          </a>
        `;
        catGallery.appendChild(tile);
      });
    })
    .catch(err => {
      console.error('Ошибка загрузки категорий:', err);
      catGallery.innerHTML = '<p>Не удалось загрузить категории.</p>';
    });
}
