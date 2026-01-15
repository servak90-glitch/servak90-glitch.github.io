
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore'; // Need store for lang
import { t, TEXT_IDS } from '../services/localization';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const lang = useGameStore(s => s.settings.language);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="relative w-full max-w-2xl h-[85vh] bg-zinc-950 border-2 border-zinc-700 shadow-[0_0_50px_rgba(0,255,255,0.1)] flex flex-col overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* CRT Scanline Background */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

          {/* HEADER */}
          <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/80 z-10">
            <div>
                <h2 className="pixel-text text-lg md:text-xl text-cyan-400 tracking-widest">{t(TEXT_IDS.MANUAL_BUTTON, lang)}</h2>
                <p className="text-[10px] text-zinc-500 font-mono">АКТУАЛЬНО ДЛЯ: v2.2.0 (DEFENSE UPDATE)</p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl px-2">✕</button>
          </div>

          {/* CONTENT SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 font-mono text-xs md:text-sm text-zinc-300 z-10 scrollbar-hide touch-pan-y">
            
            {/* 1. OBJECTIVE */}
            <section>
                <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">1. ЦЕЛЬ И ЗАДАЧИ</h3>
                <p className="mb-2"><span className="text-cyan-400 font-bold">ОСНОВНАЯ ЗАДАЧА:</span> Бурить вглубь до 100,000 метров (Радиоактивное Ядро).</p>
                <p>Собирайте ресурсы, улучшайте бур в Цехе, изучайте древние технологии (Ancient Tech) и сражайтесь со стражами глубин.</p>
            </section>

            {/* 2. HUD & MECHANICS */}
            <section>
                <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">2. ИНТЕРФЕЙС И МЕХАНИКИ</h3>
                <ul className="list-disc pl-4 space-y-2">
                    <li>
                        <span className="text-orange-400 font-bold">НАГРЕВ:</span> При бурении температура растет.
                        <br/><span className="text-zinc-500 text-[10px]">95% &rarr; Активируется мини-игра охлаждения (кликайте по клапанам).</span>
                        <br/><span className="text-zinc-500 text-[10px]">100% &rarr; Аварийная остановка и урон обшивке.</span>
                    </li>
                    <li>
                        <span className="text-amber-400 font-bold">ЭНЕРГИЯ (LOAD):</span> Если потребление (Cons) превышает выработку (Prod), скорость бурения падает пропорционально.
                    </li>
                    <li>
                        <span className="text-green-400 font-bold">ЛЕТАЮЩИЕ ОБЪЕКТЫ:</span> Нажимайте на пролетающие камни и обломки спутников в шахте, чтобы получить бонусные ресурсы и XP.
                    </li>
                </ul>
            </section>

            {/* 3. ARTIFACTS & LAB */}
            <section>
                <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">3. СКЛАД И АРТЕФАКТЫ</h3>
                <div className="space-y-2">
                    <p><span className="font-bold text-white">Неизвестные объекты:</span> Выпадают с боссов и событий. Требуют <span className="text-cyan-400">АНАЛИЗА</span> в лаборатории. Время анализа зависит от редкости (от 10 сек до 1 часа).</p>
                    <p><span className="font-bold text-white">Трансмутация:</span> В меню "ЦЕХ" &rarr; "СИНТЕЗ" можно объединить 3 артефакта одной редкости, чтобы получить 1 артефакт более высокой редкости.</p>
                    <p><span className="font-bold text-white">Сборка:</span> Вы можете экипировать до 3-х артефактов одновременно для получения пассивных бонусов.</p>
                </div>
            </section>

            {/* 4. FORGE & FUSION */}
            <section>
                <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">4. ЦЕХ (FORGE)</h3>
                <p className="mb-2">Стандартные улучшения доступны до 12 Тира (Legendary).</p>
                <div className="bg-purple-900/20 border border-purple-500/50 p-3 rounded">
                    <div className="text-purple-400 font-bold mb-1 pixel-text text-xs">АТОМНЫЙ РЕКОНСТРУКТОР</div>
                    <p className="text-[10px] md:text-xs">
                        Для создания предметов божественного уровня (Godly, Tier 13-15) требуется <span className="text-white font-bold">СИНТЕЗ</span>.
                        <br/>Это требует редких ресурсов (Ancient Tech, Gems) и выполнения особых условий (например, достичь глубины без повреждений).
                    </p>
                </div>
            </section>

            {/* 5. CITY */}
            <section>
                <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">5. ГОРОД</h3>
                <ul className="list-disc pl-4 space-y-1 text-[10px] md:text-xs">
                    <li><span className="text-amber-400">Рынок:</span> Обмен простых ресурсов.</li>
                    <li><span className="text-purple-400">Ювелир:</span> Продажа самоцветов за Деньги или XP.</li>
                    <li><span className="text-white">Контракты:</span> Задания фракций. "Корпорация" платит ресурсами, "Ученые" — опытом.</li>
                    <li><span className="text-green-400">Бар:</span> Рискованные напитки с мощными временными эффектами.</li>
                </ul>
            </section>

            {/* 6. COMBAT & DEFENSE */}
            <section>
                <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">6. БОЕВАЯ СИСТЕМА И ЗАЩИТА</h3>
                <p className="mb-2">Каждые ~500м глубины есть шанс встретить Босса.</p>
                
                <div className="bg-zinc-900 border border-blue-900/50 p-3 mb-2 rounded">
                    <h4 className="text-blue-400 font-bold mb-1 text-xs">ПРОТОКОЛЫ ВЫЖИВАНИЯ</h4>
                    <ul className="list-disc pl-4 space-y-2 text-[10px] md:text-xs">
                        <li>
                            <span className="text-cyan-400 font-bold">КИНЕТИЧЕСКИЙ ЩИТ (ACTIVE):</span>
                            <br/>Бур накапливает заряд щита во время работы.
                            <br/><b>ОТПУСТИТЕ КНОПКУ</b> прямо перед ударом босса, чтобы активировать щит. Это заблокирует <b>80%</b> урона.
                        </li>
                        <li>
                            <span className="text-zinc-400 font-bold">УКЛОНЕНИЕ (PASSIVE):</span>
                            <br/>Шанс полностью избежать урона (MISS). Зависит от уровней <span className="text-white">Двигателя</span> и <span className="text-white">Логики</span>.
                            <br/><span className="text-red-400">Внимание:</span> При перегреве шанс уклонения падает на 50%.
                        </li>
                    </ul>
                </div>

                <ul className="list-disc pl-4 space-y-1 text-[10px] md:text-xs">
                    <li><span className="text-red-400">Атака:</span> Кликайте, чтобы наносить урон.</li>
                    <li><span className="text-purple-400">Взлом:</span> Если босс включает неуязвимость, выиграйте мини-игру, чтобы отключить его щит.</li>
                </ul>
            </section>

            {/* 7. BLACK BOX */}
            <section className="bg-red-950/20 border border-red-900 p-2">
                <h3 className="text-red-500 font-bold border-b border-red-900 pb-1 mb-2 text-sm md:text-base pixel-text">
                    {t(TEXT_IDS.HELP_SECTION_SAVE_TITLE, lang)}
                </h3>
                <p className="text-zinc-300">
                    {t(TEXT_IDS.HELP_SECTION_SAVE_BODY, lang)}
                </p>
            </section>

            {/* 8. BACKUP (NEW) */}
            <section className="bg-cyan-950/20 border border-cyan-900 p-2">
                <h3 className="text-cyan-500 font-bold border-b border-cyan-900 pb-1 mb-2 text-sm md:text-base pixel-text">
                    {t(TEXT_IDS.HELP_SECTION_EXPORT_TITLE, lang)}
                </h3>
                <p className="text-zinc-300 whitespace-pre-wrap">
                    {t(TEXT_IDS.HELP_SECTION_EXPORT_BODY, lang)}
                </p>
            </section>

          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 z-10 flex justify-end">
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold pixel-text text-xs transition-colors"
             >
               {t(TEXT_IDS.BTN_OK, lang)}
             </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HelpModal;
