const fs = require('fs');
const path = require('path');

// Создаем папку dist если её нет
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Копируем HTML файлы (только собранные файлы для index.html)
const htmlFiles = ['prediction.html', 'training.html'];
htmlFiles.forEach(htmlFile => {
  const possiblePaths = [
    path.join(__dirname, 'public', 'dist', htmlFile), // Собранные файлы
    path.join(__dirname, 'public', htmlFile), // Исходные файлы
    path.join(__dirname, htmlFile),
    path.join(__dirname, '..', 'public', 'dist', htmlFile),
    path.join(__dirname, '..', 'public', htmlFile),
    path.join(__dirname, '..', htmlFile)
  ];
  
  let srcPath = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      srcPath = possiblePath;
      break;
    }
  }
  
  const destPath = path.join(distDir, htmlFile);
  
  if (srcPath) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Скопирован: ${htmlFile} из ${srcPath}`);
  } else {
    console.log(`Не найден: ${htmlFile} в любом из путей:`, possiblePaths);
  }
});

// Копируем собранное React приложение из public/dist (если есть)
const publicDistDir = path.join(__dirname, 'public', 'dist');
if (fs.existsSync(publicDistDir)) {
  console.log('Копируем собранное React приложение...');
  const files = fs.readdirSync(publicDistDir);
  files.forEach(file => {
    const srcPath = path.join(publicDistDir, file);
    const destPath = path.join(distDir, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // Копируем папку рекурсивно
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
    console.log(`Скопирован: ${file}`);
  });
} else {
  console.log('Папка public/dist не найдена, пропускаем копирование React приложения');
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

// Функция для рекурсивного копирования папок
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log('Копирование файлов завершено!');
