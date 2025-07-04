// up-button.js

// Создаем кнопку "Наверх"
const upBtn = document.createElement('button');
upBtn.id = 'upButton';
upBtn.title = 'Наверх';
upBtn.textContent = '↑';
upBtn.style.cssText = `
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: none;
  padding: 10px 15px;
  font-size: 24px;
  background-color: #a63b3b;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
`;

// Добавляем кнопку в DOM
document.body.appendChild(upBtn);

// Показываем кнопку при прокрутке вниз
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    upBtn.style.display = 'block';
  } else {
    upBtn.style.display = 'none';
  }
});

// Плавная прокрутка наверх по клику
upBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
