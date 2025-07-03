// ⭐ Показ избранного на странице favorites.html
document.addEventListener("DOMContentLoaded", () => {
  const productListEl = document.getElementById('favorites-list');

  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (!favs.length) {
    productListEl.innerHTML = '<p>У вас пока нет избранных товаров.</p>';
    return;
  }

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRWJ_CpYRd1TvS3NWbto7jEZ2VPBe2zORR1U3_dCkRxo_3ao7hptKeEfZrnILQID9y_ex8UDRSStvP-/pub?output=tsv')
    .then(res => res.text())
    .then(text => parseTSV(text))
    .then(data => {
      const filtered = data.filter(p => favs.includes(p.название));
      showFavorites(filtered);
