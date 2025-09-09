const fs = require('fs');
const path = require('path');

// Копируем изображения в dist
const images = ['1win_logo.png', 'attention.png', 'background.png', 'mines.png', 'star.png'];

images.forEach(image => {
  const srcPath = path.join(__dirname, 'public', image);
  const destPath = path.join(__dirname, 'dist', image);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Скопирован: ${image}`);
  } else {
    console.log(`Не найден: ${image}`);
  }
});

console.log('Копирование изображений завершено!');
