
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from 'react';

export interface FloatingTextHandle {
  addText: (x: number, y: number, text: string, type?: 'DAMAGE' | 'RESOURCE' | 'CRIT' | 'HEAL' | 'INFO' | 'EVADE' | 'BLOCKED') => void;
  // [DEV_CONTEXT: OPTIMIZATION v5.2] Новый метод для накопительных значений
  addAccumulated: (key: string, amount: number, type?: 'RESOURCE' | 'DAMAGE') => void;
}

interface TextItem {
  id: number;
  x: number;
  y: number;
  text: string;
  type: 'DAMAGE' | 'RESOURCE' | 'CRIT' | 'HEAL' | 'INFO' | 'EVADE' | 'BLOCKED';
}

// [DEV_CONTEXT: OPTIMIZATION v5.2] Накопительные счётчики для ресурсов
interface AccumulatedValue {
  amount: number;
  type: 'RESOURCE' | 'DAMAGE';
  lastUpdate: number;
  visible: boolean;
}

const FloatingTextOverlay = forwardRef<FloatingTextHandle, {}>((props, ref) => {
  const [items, setItems] = useState<TextItem[]>([]);
  const counterRef = useRef(0);

  // [DEV_CONTEXT: OPTIMIZATION v5.2] Хранилище накопленных значений
  const accumulatedRef = useRef<Map<string, AccumulatedValue>>(new Map());
  const [accumulatedDisplay, setAccumulatedDisplay] = useState<Map<string, AccumulatedValue>>(new Map());

  // Таймер для скрытия накопленных значений
  const hideTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Обновление отображения накопленных значений
  const updateAccumulatedDisplay = useCallback(() => {
    setAccumulatedDisplay(new Map(accumulatedRef.current));
  }, []);

  useImperativeHandle(ref, () => ({
    addText: (x, y, text, type = 'INFO') => {
      // [DEV_CONTEXT: OPTIMIZATION v5.2] Фильтруем частые RESOURCE-тексты
      // Они теперь обрабатываются через addAccumulated
      if (type === 'RESOURCE') {
        // Парсим текст формата "+123 STONE"
        const match = text.match(/^\+?([\d.]+)\s+(.+)$/);
        if (match) {
          const amount = parseFloat(match[1]);
          const resource = match[2];

          // Перенаправляем в накопительную систему
          const key = resource;
          const current = accumulatedRef.current.get(key) || { amount: 0, type: 'RESOURCE', lastUpdate: 0, visible: false };
          current.amount += amount;
          current.lastUpdate = Date.now();
          current.visible = true;
          accumulatedRef.current.set(key, current);

          // Сбрасываем таймер скрытия
          const existingTimeout = hideTimeoutRef.current.get(key);
          if (existingTimeout) clearTimeout(existingTimeout);

          hideTimeoutRef.current.set(key, setTimeout(() => {
            const val = accumulatedRef.current.get(key);
            if (val) {
              val.visible = false;
              val.amount = 0; // Сброс после скрытия
              accumulatedRef.current.set(key, val);
              updateAccumulatedDisplay();
            }
          }, 800)); // Скрываем через 800ms после последнего обновления

          updateAccumulatedDisplay();
          return; // Не создаём отдельный элемент
        }
      }

      // Остальные типы текста — стандартная обработка (но реже)
      const id = counterRef.current++;
      // Randomize position slightly to prevent stacking
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 20;

      setItems(prev => {
        // [DEV_CONTEXT: OPTIMIZATION v5.2] Лимит на количество одновременных элементов
        if (prev.length >= 10) {
          return [...prev.slice(-9), { id, x: x + offsetX, y: y + offsetY, text, type }];
        }
        return [...prev, { id, x: x + offsetX, y: y + offsetY, text, type }];
      });

      // Auto-remove after animation
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== id));
      }, 1000);
    },

    // [DEV_CONTEXT: OPTIMIZATION v5.2] Прямой метод для накопления
    addAccumulated: (key: string, amount: number, type: 'RESOURCE' | 'DAMAGE' = 'RESOURCE') => {
      const current = accumulatedRef.current.get(key) || { amount: 0, type, lastUpdate: 0, visible: false };
      current.amount += amount;
      current.lastUpdate = Date.now();
      current.visible = true;
      current.type = type;
      accumulatedRef.current.set(key, current);

      // Сбрасываем таймер скрытия
      const existingTimeout = hideTimeoutRef.current.get(key);
      if (existingTimeout) clearTimeout(existingTimeout);

      hideTimeoutRef.current.set(key, setTimeout(() => {
        const val = accumulatedRef.current.get(key);
        if (val) {
          val.visible = false;
          val.amount = 0;
          accumulatedRef.current.set(key, val);
          updateAccumulatedDisplay();
        }
      }, 800));

      updateAccumulatedDisplay();
    }
  }));

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      hideTimeoutRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Форматирование чисел
  const formatNumber = (n: number): string => {
    if (n < 1) return n.toFixed(2);
    if (n < 10) return n.toFixed(1);
    if (n < 1000) return Math.floor(n).toString();
    if (n < 1000000) return (n / 1000).toFixed(1) + 'k';
    return (n / 1000000).toFixed(1) + 'M';
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* [DEV_CONTEXT: OPTIMIZATION v5.2] Накопительные счётчики — одна надпись на ресурс */}
      {Array.from(accumulatedDisplay.entries()).map(([key, value], index) => {
        if (!value.visible || value.amount <= 0) return null;

        const isResource = value.type === 'RESOURCE';
        const colorClass = isResource
          ? 'text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]'
          : 'text-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]';

        return (
          <div
            key={key}
            className={`absolute ${colorClass} text-lg md:text-xl font-bold font-mono 
                       transition-all duration-200 ease-out animate-pulse`}
            style={{
              left: '50%',
              top: `${35 + index * 8}%`,
              transform: 'translateX(-50%)',
              textShadow: '0 0 8px currentColor'
            }}
          >
            +{formatNumber(value.amount)} {key}
          </div>
        );
      })}

      {/* Остальные надписи (не-RESOURCE) — стандартная анимация */}
      {items.map(item => {
        let colorClass = 'text-white';
        let sizeClass = 'text-xs md:text-sm';
        let fontClass = 'font-mono font-bold';

        if (item.type === 'DAMAGE') {
          colorClass = 'text-white drop-shadow-[0_0_2px_black]';
        } else if (item.type === 'CRIT') {
          colorClass = 'text-yellow-400 drop-shadow-[0_0_5px_red]';
          sizeClass = 'text-lg md:text-2xl';
          fontClass = 'pixel-text';
        } else if (item.type === 'RESOURCE') {
          colorClass = 'text-green-400 drop-shadow-[0_0_2px_black]';
        } else if (item.type === 'HEAL') {
          colorClass = 'text-cyan-400';
        } else if (item.type === 'INFO') {
          colorClass = 'text-zinc-400 text-[10px]';
        } else if (item.type === 'EVADE') {
          colorClass = 'text-zinc-300 opacity-80';
          sizeClass = 'text-sm';
          fontClass = 'font-mono italic';
        } else if (item.type === 'BLOCKED') {
          colorClass = 'text-blue-400 opacity-90';
          sizeClass = 'text-sm';
          fontClass = 'font-mono';
        }

        return (
          <div
            key={item.id}
            className={`absolute ${colorClass} ${sizeClass} ${fontClass} animate-float-up select-none`}
            style={{ left: item.x, top: item.y }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
});

export default FloatingTextOverlay;
