# Konevsky WebApp

Веб-приложение с игрой Mines и системой прогнозов.

**🌐 Live Demo:** [https://web-production-55991.up.railway.app](https://web-production-55991.up.railway.app)

## Функции

- 🎮 Игра Mines с различным количеством мин (2, 3, 5, 7)
- 🔮 Система прогнозов с автоматическим обновлением каждые 15 минут
- 📊 Статистика и админская панель
- 📱 Адаптивный дизайн для мобильных устройств
- 🎨 Современный UI с анимациями

## Технологии

- **Frontend:** React, Vite, CSS3
- **Backend:** Node.js, Express
- **Deployment:** Railway

## Доступные страницы

- **Главная:** [https://web-production-55991.up.railway.app](https://web-production-55991.up.railway.app)
- **Игра Mines:** [https://web-production-55991.up.railway.app/1win](https://web-production-55991.up.railway.app/1win)
- **Прогнозы:** [https://web-production-55991.up.railway.app/prediction](https://web-production-55991.up.railway.app/prediction)
- **Обучение:** [https://web-production-55991.up.railway.app/training](https://web-production-55991.up.railway.app/training)

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

## Сборка

```bash
npm run build
```

## Запуск

```bash
npm start
```

## API Endpoints

- `GET /` - Главная страница
- `GET /prediction` - Страница прогнозов
- `GET /training` - Страница обучения
- `GET /1win` - Игра Mines
- `GET /api/game-data` - Получить данные игры
- `POST /api/save-game` - Сохранить данные игры
- `POST /api/reset-prediction` - Сбросить прогноз (админ)
- `GET /api/stats` - Получить статистику
- `POST /api/stats` - Обновить статистику

## Автоматическое обновление прогнозов

Прогнозы автоматически обновляются каждые 15 минут. Также доступен ручной сброс через админскую панель.
