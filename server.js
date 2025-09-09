const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// API для сохранения данных игры
app.post('/api/save-game', (req, res) => {
  try {
    const { mineCount, minePositions, starPositions } = req.body;
    
    const gameData = {
      lastGame: {
        mineCount,
        minePositions,
        starPositions,
        timestamp: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(path.join(__dirname, 'game-data.json'), JSON.stringify(gameData, null, 2));
    
    res.json({ success: true, message: 'Данные игры сохранены' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для получения данных игры
app.get('/api/game-data', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'game-data.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для получения статистики
app.get('/api/stats', (req, res) => {
  try {
    const statsPath = path.join(__dirname, 'stats.json');
    if (fs.existsSync(statsPath)) {
      const data = fs.readFileSync(statsPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      // Создаем файл со статистикой по умолчанию
      const defaultStats = {
        signalsCount: 0,
        userProfit: 0
      };
      fs.writeFileSync(statsPath, JSON.stringify(defaultStats, null, 2));
      res.json(defaultStats);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для обновления статистики
app.post('/api/stats', (req, res) => {
  try {
    const { signalsCount, userProfit } = req.body;
    const stats = {
      signalsCount: signalsCount || 0,
      userProfit: userProfit || 0
    };
    
    fs.writeFileSync(path.join(__dirname, 'stats.json'), JSON.stringify(stats, null, 2));
    res.json({ success: true, message: 'Статистика обновлена' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для принудительного сброса прогноза (админская панель)
app.post('/api/reset-prediction', (req, res) => {
  try {
    const { mineCount = 2 } = req.body;
    
    // Генерируем новые позиции мин
    const minePositions = [];
    while (minePositions.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!minePositions.includes(pos)) {
        minePositions.push(pos);
      }
    }
    
    // Генерируем позиции звезд
    const starPositions = [];
    for (let i = 0; i < 25; i++) {
      if (!minePositions.includes(i)) {
        starPositions.push(i);
      }
    }
    
    const gameData = {
      lastGame: {
        mineCount,
        minePositions,
        starPositions,
        timestamp: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(path.join(__dirname, 'game-data.json'), JSON.stringify(gameData, null, 2));
    
    console.log(`Прогноз принудительно сброшен: ${mineCount} мин, позиции:`, minePositions);
    res.json({ 
      success: true, 
      message: 'Прогноз сброшен', 
      mineCount, 
      minePositions, 
      starPositions 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Главная страница - показывает статистику
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница прогноза
app.get('/prediction', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'prediction.html'));
});

// Страница обучения
app.get('/training', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'training.html'));
});

// Статические файлы из папки styles
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// Статические файлы из dist (собранные) - для всех путей
app.use(express.static(path.join(__dirname, 'dist')));

// Страница игры mines по маршруту /1win
app.get('/1win', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Главная страница: https://web-production-55991.up.railway.app`);
  console.log(`Игра mines: https://web-production-55991.up.railway.app/1win`);
  console.log(`API: https://web-production-55991.up.railway.app/api/game-data`);
});