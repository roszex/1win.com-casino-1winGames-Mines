const fs = require('fs');
const path = require('path');

// Создаем папку dist если её нет
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Копируем изображения в dist
const images = ['1win_logo.png', 'attention.png', 'background.png', 'mines.png', 'star.png'];

images.forEach(image => {
  // Проверяем несколько возможных путей
  const possiblePaths = [
    path.join(__dirname, 'public', image),
    path.join(__dirname, image),
    path.join(__dirname, '..', 'public', image),
    path.join(__dirname, '..', image)
  ];
  
  let srcPath = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      srcPath = possiblePath;
      break;
    }
  }
  
  const destPath = path.join(distDir, image);
  
  if (srcPath) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Скопирован: ${image} из ${srcPath}`);
  } else {
    console.log(`Не найден: ${image} в любом из путей:`, possiblePaths);
  }
});

console.log('Копирование изображений завершено!');
