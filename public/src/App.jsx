import React, { useState, useEffect } from 'react'
import './App.css'

// Telegram WebApp
const tg = window.Telegram?.WebApp

function App() {
  // Инициализация Telegram WebApp для полноэкранного режима
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      try {
        // Расширяем WebApp на весь экран
        tg.expand();
        
        // Запрашиваем полноэкранный режим если доступен
        if (tg.requestFullscreen) {
          tg.requestFullscreen();
        }
        
        // Устанавливаем цвета темы для соответствия приложению
        tg.setHeaderColor('#000000');
        tg.setBackgroundColor('#000000');
        
        // Отключаем подтверждение закрытия для предотвращения сообщения "изменения могут не сохраниться"
        if (tg.enableClosingConfirmation) {
          // Не включаем подтверждение закрытия
        }
        
        // Устанавливаем основную кнопку если нужно
        if (tg.MainButton) {
          tg.MainButton.hide();
        }
        
        console.log('Telegram WebApp инициализирован успешно в полноэкранном режиме');
      } catch (error) {
        console.error('Ошибка инициализации Telegram WebApp:', error);
      }
    } else {
      console.log('Telegram WebApp недоступен - запуск в режиме браузера');
    }
  }, [])
  // Получаем прогноз из URL параметров при инициализации
  const getInitialCount = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const trapCount = urlParams.get('trapCount')
    console.log('URL параметры:', {
      trapCount: urlParams.get('trapCount'),
      trapPositions: urlParams.get('trapPositions')
    })
    if (trapCount) {
      return parseInt(trapCount)
    }
    return 2
  }

  const [selectedCount, setSelectedCount] = useState(getInitialCount())
  
  // Загружаем прогноз при инициализации
  useEffect(() => {
    const loadPrediction = async () => {
      // Сначала пробуем URL параметры
      const urlParams = new URLSearchParams(window.location.search)
      const trapCount = urlParams.get('trapCount')
      const trapPositions = urlParams.get('trapPositions')
      
      if (trapCount && trapPositions) {
        try {
          const positions = trapPositions.split(',').map(pos => parseInt(pos))
          setMines(new Set(positions))
          console.log('Загружен прогноз из URL:', { trapCount, positions })
          return
        } catch (error) {
          console.error('Ошибка парсинга позиций из URL:', error)
        }
      }
      
      // Если URL параметров нет, читаем из localStorage
      try {
        const predictionData = localStorage.getItem('minesPrediction')
        if (predictionData) {
          const prediction = JSON.parse(predictionData)
          setMines(new Set(prediction.trapPositions))
          console.log('Загружен прогноз из localStorage:', prediction)
        }
      } catch (error) {
        console.error('Ошибка загрузки прогноза из localStorage:', error)
      }
    }
    
    loadPrediction()
  }, [])

  // Эффект для загрузки статистики
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        if (data) {
          setSignalsCount(data.signalsCount || 0)
          setUserProfit(data.userProfit || 0)
        }
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error)
      }
    }
    
    loadStats()
  }, [])
  
  const [isAnimating, setIsAnimating] = useState(false)
  const [boxWidth, setBoxWidth] = useState(81)
  const [randomValue, setRandomValue] = useState(50)
  const [inputValue, setInputValue] = useState('')
  const [gameBalance, setGameBalance] = useState(158342)
  const [gameStarted, setGameStarted] = useState(false)
  const [revealedCells, setRevealedCells] = useState(new Set())
  const [gameOver, setGameOver] = useState(false)
  const [mines, setMines] = useState(new Set())
  const [starPositions, setStarPositions] = useState(new Set())
  const [betAmount, setBetAmount] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [winAmount, setWinAmount] = useState(0)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [newBalance, setNewBalance] = useState('150000')
  const [timeUntilUpdate, setTimeUntilUpdate] = useState(900) // 5 минут в секундах
  const [signalsCount, setSignalsCount] = useState(0)
  const [userProfit, setUserProfit] = useState(0)
  const counts = [2, 3, 5, 7]

  // Коэффициенты для разных количеств мин
  const coefficients = {
    2: [1.02, 1.11, 1.22, 1.34, 1.48, 1.64, 1.84, 2.07, 2.35, 2.68, 3.09, 3.61, 4.27, 5.12, 6.26, 7.83, 10.07, 13.42, 18.80, 28.20, 47.00, 94.00, 282.00],
    3: [1.06, 1.22, 1.40, 1.62, 1.89, 2.23, 2.64, 3.17, 3.86, 4.75, 5.93, 7.55, 9.82, 13.10, 18.01, 25.73, 38.60, 61.77, 108.10, 216.20, 540.50, 2162.00],
    5: [1.17, 1.48, 1.89, 2.45, 3.22, 4.29, 5.82, 8.07, 11.43, 16.63, 24.94, 38.80, 63.05, 108.09, 198.18, 396.36, 891.82, 2378.19, 8323.69, 49942.20],
    7: [1.30, 1.84, 2.64, 3.88, 5.82, 8.96, 14.19, 23.23, 39.49, 70.21, 131.66, 263.32, 570.52, 1369.20, 3765.48, 12551.61, 56482.25, 451858.00]
  }

  // Функция для генерации и сохранения прогноза
  const generateAndSaveField = async (mineCount) => {
    const minePositions = new Set()
    while (minePositions.size < mineCount) {
      minePositions.add(Math.floor(Math.random() * 25))
    }
    
    const starPositions = new Set()
    for (let i = 0; i < 25; i++) {
      if (!minePositions.has(i)) {
        starPositions.add(i)
      }
    }
    
    setMines(minePositions)
    setStarPositions(starPositions)
    
    // Сохраняем данные игры
    try {
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mineCount,
          minePositions: Array.from(minePositions),
          starPositions: Array.from(starPositions)
        })
      })
      
      if (response.ok) {
        console.log('Прогноз сохранен:', mineCount, 'мин')
      }
    } catch (error) {
      console.error('Ошибка сохранения прогноза:', error)
    }
  }

  const handleCountChange = (count) => {
    if (count !== selectedCount) {
      setIsAnimating(true)
      setTimeout(() => {
        setSelectedCount(count)
        // Сбрасываем игру при изменении количества мин
        setGameStarted(false)
        setGameOver(false)
        setRevealedCells(new Set())
        setMines(new Set())
        setStarPositions(new Set())
        setBetAmount(0)
        
        // Генерируем новый прогноз сразу при выборе количества мин
        generateAndSaveField(count)
        
        setTimeout(() => setIsAnimating(false), 50)
      }, 100)
    }
  }

  // Функции для изменения ширины блока
  const increaseWidth = () => {
    setBoxWidth(prev => Math.min(150, prev + 10))
  }

  const decreaseWidth = () => {
    setBoxWidth(prev => Math.max(50, prev - 10))
  }

  const setWidth = (width) => {
    setBoxWidth(Math.max(50, Math.min(150, width)))
  }

  const handleInputChange = (e) => {
    console.log('handleInputChange вызван')
    
    // Получаем весь текст из contentEditable
    let value = e.target.textContent || e.target.innerText || ''
    console.log('Исходное значение из contentEditable:', value)
    
    // Убираем .00₽ из текста
    value = value.replace('.00₽', '')
    console.log('После удаления .00₽:', value)
    
    // Оставляем только цифры
    value = value.replace(/[^0-9]/g, '')
    console.log('После очистки:', value)
    
    // Ограничиваем максимальное значение
    const numValue = parseInt(value)
    if (numValue > 999999) {
      value = '999999'
    }
    
    console.log('Финальное значение:', value)
    setInputValue(value)
    
    // Очищаем contentEditable и устанавливаем правильную структуру
    e.target.innerHTML = `<span class="number-part">${value}</span><span class="decimal-part">.00₽</span>`
  }

  // Эффект для плавного изменения значения
  useEffect(() => {
    const updateRandomValue = () => {
      setRandomValue(prev => {
        // Определяем направление изменения (70% шанс увеличения, 30% уменьшения)
        const shouldIncrease = Math.random() < 0.7
        
        if (shouldIncrease) {
          // Увеличиваем на 2-3
          const increase = Math.floor(Math.random() * 2) + 2 // 2 или 3
          return Math.min(99, prev + increase)
        } else {
          // Уменьшаем на 2-3, но не ниже 50
          const decrease = Math.floor(Math.random() * 2) + 2 // 2 или 3
          return Math.max(50, prev - decrease)
        }
      })
      
      // Задержка от 1 до 3 секунд
      const delay = Math.random() * 2000 + 1000
      setTimeout(updateRandomValue, delay)
    }
    
    updateRandomValue()
  }, [])

  // Эффект для автоматического скрытия уведомления
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [showNotification])

  // Эффект для автоматического скрытия уведомления о зачислении
  useEffect(() => {
    if (showSuccessNotification) {
      const timer = setTimeout(() => {
        setShowSuccessNotification(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showSuccessNotification])

  // Эффект для автоматического обновления прогноза каждые 15 минут
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilUpdate(prev => {
        if (prev <= 1) {
          // Обновляем прогноз независимо от текущего состояния игры
          console.log('Автоматическое обновление прогноза через 15 минут')
          generateAndSaveField(selectedCount)
          return 900 // Сбрасываем на 15 минут
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedCount])

  // Отдельный эффект для принудительного обновления прогноза каждые 15 минут
  useEffect(() => {
    const autoUpdateTimer = setInterval(() => {
      console.log('Принудительное обновление прогноза каждые 15 минут')
      generateAndSaveField(selectedCount)
    }, 15 * 60 * 1000) // 15 минут в миллисекундах

    return () => clearInterval(autoUpdateTimer)
  }, [selectedCount])

  const getSelectionBoxStyle = () => {
    const selectedIndex = counts.indexOf(selectedCount)
    const leftPosition = (selectedIndex * 81) + 5 // 81px ширина + 5px отступ
    
    return {
      left: `${leftPosition}px`,
      top: '5px',
      width: '81px',
      height: '36px',
      opacity: isAnimating ? '0' : '1'
    }
  }

  const starsCount = 25 - selectedCount
  const minesCount = selectedCount
  const balance = 156324 // Баланс

  // Создаем массив ячеек 5x5
  const createCells = () => {
    const cells = []
    const cellWidth = 103
    const cellHeight = 78
    const spacing = 8
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 684 + col * (cellWidth + spacing)
        const y = 240 + row * (cellHeight + spacing)
        
        cells.push({
          id: row * 5 + col,
          x,
          y,
          row,
          col
        })
      }
    }
    return cells
  }

  const cells = createCells()

  // Функция для начала игры
  const startGame = () => {
    console.log('inputValue:', inputValue, 'type:', typeof inputValue)
    
    // Проверяем, есть ли введенное значение
    if (!inputValue || inputValue.trim() === '') {
      console.log('Нет введенного значения')
      setShowNotification(true)
      return
    }
    
    const currentBet = parseInt(inputValue)
    console.log('currentBet:', currentBet, 'gameBalance:', gameBalance)
    
    if (isNaN(currentBet) || currentBet <= 0) {
      console.log('Некорректная ставка')
      setShowNotification(true)
      return
    }
    
    if (currentBet > gameBalance) {
      console.log('Ставка больше баланса')
      return
    }
    
    console.log('Запускаем игру со ставкой:', currentBet)
    
    setBetAmount(currentBet)
    setGameBalance(prev => prev - currentBet)
    setGameStarted(true)
    setGameOver(false)
    setRevealedCells(new Set())
    
    // Если прогноза нет, размещаем мины случайно
    if (mines.size === 0) {
      const minePositions = new Set()
      while (minePositions.size < selectedCount) {
        minePositions.add(Math.floor(Math.random() * 25))
      }
      setMines(minePositions)
      
      // Создаем позиции звезд (все остальные ячейки)
      const starPositions = new Set()
      for (let i = 0; i < 25; i++) {
        if (!minePositions.has(i)) {
          starPositions.add(i)
        }
      }
      
      // Устанавливаем позиции звезд в состояние
      setStarPositions(starPositions)
      
      // Сохраняем данные игры
      saveGameData(minePositions, starPositions)
      
      console.log(`Размещено ${selectedCount} мин:`, Array.from(minePositions))
      console.log(`Размещено ${starPositions.size} звезд:`, Array.from(starPositions))
    } else {
      // Если мины уже есть, создаем позиции звезд для них
      const starPositions = new Set()
      for (let i = 0; i < 25; i++) {
        if (!mines.has(i)) {
          starPositions.add(i)
        }
      }
      setStarPositions(starPositions)
    }
  }

  // Функция для сохранения данных игры
  const saveGameData = async (minePositions, starPositions) => {
    try {
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mineCount: selectedCount,
          minePositions: Array.from(minePositions),
          starPositions: Array.from(starPositions)
        })
      });
      
      if (response.ok) {
        console.log('Данные игры сохранены');
      }
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
    }
  };

  // Функция для показа всех ячеек
  const revealAllCells = () => {
    const allCells = new Set()
    for (let i = 0; i < 25; i++) {
      allCells.add(i)
    }
    setRevealedCells(allCells)
  }

  // Функция для взятия выигрыша
  const takeWin = () => {
    const openedCells = revealedCells.size
    const coefficient = coefficients[selectedCount][openedCells - 1] || 1
    const currentWinAmount = Math.floor(betAmount * coefficient)
    
    // Показываем все ячейки перед забором выигрыша
    revealAllCells()
    
    setWinAmount(currentWinAmount)
    setGameBalance(prev => prev + currentWinAmount)
    setGameStarted(false)
    setGameOver(true)
    // НЕ сбрасываем мины и звезды - оставляем их для показа
    setBetAmount(0)
    
    // Показываем уведомление о зачислении
    setShowSuccessNotification(true)
  }

  // Функция для открытия ячейки
  const revealCell = (cellId) => {
    if (!gameStarted) {
      setShowNotification(true)
      return
    }
    if (gameOver || revealedCells.has(cellId)) return
    
    setRevealedCells(prev => new Set([...prev, cellId]))
    
    if (mines.has(cellId)) {
      // Игра окончена - мина
      setGameOver(true)
      setGameStarted(false)
      // Показываем все ячейки при проигрыше
      revealAllCells()
    }
  }

  // Функция для сброса игры
  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setRevealedCells(new Set())
    setMines(new Set())
    setBetAmount(0)
  }

  // Функция для обработки клика по области баланса
  const handleBalanceClick = (e) => {
    setShowBalanceModal(true)
  }

  // Функция для сохранения нового баланса
  const saveBalance = async () => {
    const balance = parseInt(newBalance) || 150000
    setGameBalance(balance)
    
    // Сохраняем статистику
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signalsCount,
          userProfit
        })
      })
    } catch (error) {
      console.error('Ошибка сохранения статистики:', error)
    }
    
    setShowBalanceModal(false)
  }

  // Функция для форматирования времени
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Функция для принудительного сброса прогноза (админская панель)
  const resetPrediction = async () => {
    try {
      const response = await fetch('/api/reset-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mineCount: selectedCount
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Прогноз сброшен:', data)
        
        // Обновляем состояние игры
        setMines(new Set(data.minePositions))
        setStarPositions(new Set(data.starPositions))
        setRevealedCells(new Set())
        setGameStarted(false)
        setGameOver(false)
        setBetAmount(0)
        
        // Сбрасываем таймер
        setTimeUntilUpdate(900)
        
        alert('Прогноз успешно сброшен!')
      } else {
        console.error('Ошибка сброса прогноза')
        alert('Ошибка сброса прогноза')
      }
    } catch (error) {
      console.error('Ошибка сброса прогноза:', error)
      alert('Ошибка сброса прогноза')
    }
  }

  return (
    <div className="app">
      <div className="count-selector">
        <div className="selection-box" style={getSelectionBoxStyle()}></div>
        {counts.map((count, index) => (
          <button
            key={count}
            className={`count-button ${selectedCount === count ? 'active' : ''} ${index === 3 ? 'last-button' : ''}`}
            onClick={() => handleCountChange(count)}
          >
            {count}
          </button>
        ))}
      </div>
      
      {/* Звёзды */}
      <div className="stars-display">
        {starsCount}
      </div>
      
      {/* Мины */}
      <div className="mines-display">
        {minesCount}
      </div>
      
      {/* Баланс - первое место */}
      <div className="balance-display-1" onClick={handleBalanceClick} style={{ cursor: 'pointer' }}>
        {gameBalance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      
      {/* Баланс - второе место */}
      <div className="balance-display-2" onClick={handleBalanceClick} style={{ cursor: 'pointer' }}>
        {gameBalance.toLocaleString('ru-RU')}<span className="ruble">₽</span>
      </div>
      
      {/* Рандомное значение */}
      <div className="random-display">
        {randomValue}
      </div>
      
      {/* Область взаимодействия - кнопка ставки или взятия выигрыша */}
      <div className={`interaction-area ${gameStarted ? 'game-started' : ''}`} onClick={!gameStarted ? startGame : takeWin}>
        {!gameStarted ? '' : `Забрать: ${(betAmount * (coefficients[selectedCount][revealedCells.size - 1] || 1)).toFixed(2)}₽`}
      </div>
      
      {/* Поле для ввода */}
      <div className="input-container">
        <div 
          className="input-field"
          contentEditable
          onInput={handleInputChange}
          suppressContentEditableWarning={true}
        >
          <span className="number-part">{inputValue}</span><span className="decimal-part">.00₽</span>
        </div>
      </div>
      
      {/* Игровое поле 5x5 */}
      <div className="game-field">
        {cells.map((cell) => {
          const isRevealed = revealedCells.has(cell.id)
          const isMine = mines.has(cell.id)
          const isStar = starPositions.has(cell.id)
          
          return (
            <div 
              key={cell.id} 
              data-cell-id={cell.id}
              className={`game-cell ${isRevealed ? `revealed ${isMine ? 'mine' : 'star'}` : ''}`}
              style={{
                left: `${cell.x}px`,
                top: `${cell.y}px`
              }}
              onClick={() => revealCell(cell.id)}
            >
              {!isRevealed ? (
                <img 
                  src="/1win_logo.png" 
                  alt="1win"
                  className="cell-logo"
                />
              ) : isMine ? (
                <>
                  <img 
                    src="/mines.png" 
                    alt="mine"
                    className="mine-image"
                  />
                  <div className="explosion-effect"></div>
                  <div className="explosion-effect second"></div>
                  <div className="explosion-effect third"></div>
                  <div className="explosion-effect fourth"></div>
                  <div className="explosion-effect fifth"></div>
                </>
              ) : isStar ? (
                <>
                  <img 
                    src="/star.png" 
                    alt="star"
                    className="star-image"
                  />
                  <div className="sparkle-effect"></div>
                  <div className="sparkle-effect second"></div>
                  <div className="sparkle-effect third"></div>
                  <div className="sparkle-effect fourth"></div>
                  <div className="sparkle-effect fifth"></div>
                  <div className="sparkle-effect sixth"></div>
                  <div className="sparkle-effect seventh"></div>
                  <div className="sparkle-effect eighth"></div>
                  <div className="sparkle-effect ninth"></div>
                  <div className="sparkle-effect tenth"></div>
                  <div className="sparkle-effect eleventh"></div>
                  <div className="sparkle-effect twelfth"></div>
                  <div className="sparkle-effect thirteenth"></div>
                  <div className="sparkle-effect fourteenth"></div>
                  <div className="sparkle-effect fifteenth"></div>
                  <div className="sparkle-effect sixteenth"></div>
                  <div className="sparkle-effect seventeenth"></div>
                  <div className="sparkle-effect eighteenth"></div>
                  <div className="sparkle-effect nineteenth"></div>
                  <div className="sparkle-effect twentieth"></div>
                  <div className="sparkle-effect twentyfirst"></div>
                  <div className="sparkle-effect twentysecond"></div>
                  <div className="sparkle-effect twentythird"></div>
                  <div className="sparkle-effect twentyfourth"></div>
                  <div className="sparkle-effect twentyfifth"></div>
                  <div className="sparkle-effect twentysixth"></div>
                  <div className="sparkle-effect twentyseventh"></div>
                  <div className="sparkle-effect twentyeighth"></div>
                  <div className="sparkle-effect twentyninth"></div>
                  <div className="sparkle-effect thirtieth"></div>
                  <div className="sparkle-effect thirtyfirst"></div>
                  <div className="sparkle-effect thirtysecond"></div>
                  <div className="sparkle-effect thirtythird"></div>
                  <div className="sparkle-effect thirtyfourth"></div>
                  <div className="sparkle-effect thirtyfifth"></div>
                  <div className="sparkle-effect thirtysixth"></div>
                  <div className="sparkle-effect thirtyseventh"></div>
                  <div className="sparkle-effect thirtyeighth"></div>
                  <div className="sparkle-effect thirtyninth"></div>
                  <div className="sparkle-effect fortieth"></div>
                  <div className="sparkle-effect fortyfirst"></div>
                  <div className="sparkle-effect fortysecond"></div>
                  <div className="sparkle-effect fortythird"></div>
                  <div className="sparkle-effect fortyfourth"></div>
                  <div className="sparkle-effect fortyfifth"></div>
                  <div className="sparkle-effect fortysixth"></div>
                  <div className="sparkle-effect fortyseventh"></div>
                  <div className="sparkle-effect fortyeighth"></div>
                  <div className="sparkle-effect fortyninth"></div>
                  <div className="sparkle-effect fiftieth"></div>
                </>
              ) : null}
            </div>
          )
        })}
      </div>
      
      
      {/* Уведомление о необходимости сделать ставку */}
      {showNotification && (
        <div className="notification-popup">
          <img src="./attention.png" alt="attention" className="notification-icon" />
          <span className="notification-text">Чтобы начать игру, сделай ставку</span>
        </div>
      )}
      
      {/* Уведомление о зачислении выигрыша */}
      {showSuccessNotification && (
        <div className="notification-popup success">
          <span className="notification-text">На ваш баланс успешно зачислено {winAmount.toLocaleString('ru-RU')}₽</span>
        </div>
      )}

                {/* Модальное окно для изменения баланса */}
                {showBalanceModal && (
                  <div className="modal-overlay" onClick={() => setShowBalanceModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <h3>Изменить баланс</h3>
                      <input
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        placeholder="Введите новый баланс"
                        className="balance-input"
                      />
                      <div className="stats-edit-section">
                        <h4>Редактировать статистику:</h4>
                        <div className="stat-edit-item">
                          <label>Выдано сигналов:</label>
                          <input
                            type="number"
                            value={signalsCount}
                            onChange={(e) => setSignalsCount(parseInt(e.target.value) || 0)}
                            className="stat-input"
                          />
                        </div>
                        <div className="stat-edit-item">
                          <label>Прибыль пользователей (₽):</label>
                          <input
                            type="number"
                            value={userProfit}
                            onChange={(e) => setUserProfit(parseInt(e.target.value) || 0)}
                            className="stat-input"
                          />
                        </div>
                      </div>
                      <div className="modal-buttons">
                        <button onClick={() => setShowBalanceModal(false)} className="cancel-btn">
                          Отмена
                        </button>
                        <button onClick={saveBalance} className="save-btn">
                          Сохранить
                        </button>
                      </div>
                      <div className="timer-display">
                        <div className="timer-label">Автообновление прогноза через:</div>
                        <div className="timer-value">{formatTime(timeUntilUpdate)}</div>
                      </div>
                      <div className="admin-controls">
                        <button 
                          onClick={resetPrediction} 
                          className="reset-prediction-btn"
                        >
                          🔄 Сбросить прогноз сейчас
                        </button>
                      </div>
                    </div>
                  </div>
                )}
    </div>
  )
}

export default App
