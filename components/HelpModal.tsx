
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { t, TEXT_IDS } from '../services/localization';
import { audioEngine } from '../services/audioEngine';
import { useEffect } from 'react';
import {
    Shield, Thermometer, Box, Database, Save, Zap, Skull,
    Coins, Hammer, Map, AlertCircle, Truck, Satellite,
    Cpu, Globe, Navigation, Fuel, Clock, Activity, Target
} from 'lucide-react';

interface HelpModalProps {
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const lang = useGameStore(s => s.settings.language);
    const isRU = lang === 'RU';

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-full h-full md:max-w-3xl md:h-[90vh] bg-zinc-950 md:border-2 md:border-zinc-700 shadow-[0_0_100px_rgba(0,255,255,0.05)] flex flex-col overflow-hidden"
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    {/* CRT Scanline Background Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

                    {/* HEADER */}
                    <div className="flex justify-between items-center p-4 md:p-6 border-b border-zinc-800 bg-zinc-900/40 z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                <Database className="text-cyan-400 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="pixel-text text-lg md:text-2xl text-cyan-400 tracking-widest uppercase">
                                    {isRU ? 'РУКОВОДСТВО ОПЕРАТОРА' : 'OPERATOR HANDBOOK'}
                                </h2>
                                <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">PROJECT EXODUS // AEGIS-7 // VER: 5.6.5_LOGISTICS</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { audioEngine.playUIPanelClose(); onClose(); }}
                            className="text-zinc-500 hover:text-white transition-colors p-2"
                        >
                            <AlertCircle className="w-8 h-8" />
                        </button>
                    </div>

                    {/* CONTENT SCROLL AREA */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-12 font-mono text-zinc-300 z-10 scrollbar-hide touch-pan-y">

                        {/* 0. INTRO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Activity className="text-emerald-400 w-5 h-5" />
                                <h3 className="text-emerald-400 font-bold text-base md:text-lg pixel-text uppercase">0. {isRU ? 'ПРИВЕТСТВИЕ' : 'WELCOME PILOT'}</h3>
                            </div>
                            <p className="text-xs md:text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-4 py-1 italic text-zinc-400">
                                {isRU
                                    ? "Добро пожаловать в ряды операторов Void-Piercer. Твоя задача — бурить глубже, чем кто-либо до тебя, собирать ресурсы и выживать в условиях аномалии Aegis-7. Помни: под поверхностью нет друзей, есть только ресурсы и Бездна."
                                    : "Welcome to the Void-Piercer operator corps. Your mission: drill deeper than anyone before, harvest resources, and survive the anomalies of Aegis-7. Remember: beneath the surface, there are no friends, only resources and the Abyss."
                                }
                            </p>
                        </section>

                        {/* 1. INTERFACE */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Box className="text-cyan-400 w-5 h-5" />
                                <h3 className="text-cyan-400 font-bold text-base md:text-lg pixel-text uppercase">1. {isRU ? 'ДЕШИФРАТОР ИНТЕРФЕЙСА' : 'INTERFACE DECODER'}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                                    <h4 className="text-white text-xs font-bold uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500" /> {isRU ? 'Центральный HUD' : 'Core HUD'}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500">
                                        {isRU ? 'Верхние полосы: ЦЕЛОСТНОСТЬ (прочность) и СНАРЯДЫ. Справа: ЭНЕРГИЯ и ТЕПЛО (риск взрыва).' : 'Top bars: INTEGRITY and AMMO. Right side: ENERGY and HEAT (explosion risk).'}
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                                    <h4 className="text-white text-xs font-bold uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" /> {isRU ? 'Панель Быстрого Доступа' : 'Quick Access Hub'}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500">
                                        {isRU ? 'Нижние иконки: Инвентарь, Глобальная карта, Хаб региона, Рынок и Настройки.' : 'Bottom icons: Inventory, Global Map, Regional Hub, Market, and Settings.'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 2. CORE MECHANICS */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Zap className="text-yellow-400 w-5 h-5" />
                                <h3 className="text-yellow-400 font-bold text-base md:text-lg pixel-text uppercase">2. {isRU ? 'ОСНОВЫ БУРЕНИЯ' : 'DRILLING OPERATIONS'}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start border-b border-zinc-800/50 pb-4">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Thermometer className="w-5 h-5" /></div>
                                    <div>
                                        <strong className="text-white text-xs block mb-1 uppercase">{isRU ? 'Система Охлаждения' : 'Thermal Management'}</strong>
                                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                                            {isRU ? 'При перегреве бурение блокируется. Используй кнопку PURGE (Продувка) для запуска мини-игры охлаждения. Своевременные клики по синим зонам сбросят жар мгновенно.' : 'Overheating locks your drill. Use the PURGE button to start the cooling mini-game. Timing your clicks on blue zones sheds heat instantly.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start border-b border-zinc-800/50 pb-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Shield className="w-5 h-5" /></div>
                                    <div>
                                        <strong className="text-white text-xs block mb-1 uppercase">{isRU ? 'Силовое Поле' : 'Void Shield'}</strong>
                                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                                            {isRU ? 'Щит поглощает урон от обвалов и столкновений. Заряжается АВТОМАТИЧЕСКИ, когда вы удерживаете кнопку бурения, и активируется при её отпускании.' : 'Shields soak up damage from cave-ins and collisions. It charges AUTOMATICALLY while drilling and activates when the button is released.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. NEW: GLOBAL MAP & TRANSIT */}
                        <section className="space-y-6 bg-cyan-900/5 border border-cyan-500/10 p-6 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Globe className="text-cyan-400 w-5 h-5" />
                                <h3 className="text-cyan-400 font-bold text-base md:text-lg pixel-text uppercase">3. {isRU ? 'ГЛОБАЛЬНАЯ КАРТА' : 'WORLD MAP & NAVIGATION'}</h3>
                            </div>
                            <div className="space-y-4 text-[11px] text-zinc-400 leading-relaxed">
                                <p>
                                    {isRU
                                        ? "Аэгис-7 разделена на биомы: Зеленые (безопасно), Желтые (опасно), Красные (экстремально). Каждый сектор имеет свои уникальные ресурсы и бонусы добычи."
                                        : "Aegis-7 is divided into biomes: Green (safe), Yellow (dangerous), Red (extreme). Each sector has unique resources and extraction bonuses."
                                    }
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2">
                                        <Fuel className="text-amber-500 w-4 h-4 shrink-0" />
                                        <span>
                                            <strong className="text-white uppercase">{isRU ? 'ПЕРЕМЕЩЕНИЕ' : 'TRANSIT'}:</strong><br />
                                            {isRU ? 'Требует топлива (Уголь, Мазут, Уран). Расход зависит от МАССЫ трюма и установленного оборудования. Помни: в пути бурение невозможно.' : 'Consumes fuel (Coal, Fuel Oil, Uranium). Cost scales with TOTAL MASS of cargo and gear. Note: drilling is disabled during transit.'}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Satellite className="text-cyan-400 w-4 h-4 shrink-0" />
                                        <span>
                                            <strong className="text-white uppercase">{isRU ? 'ХАБЫ РЕГИОНА' : 'REGIONAL HUBS'}:</strong><br />
                                            {isRU ? 'В каждом регионе есть Региональный Хаб. Это твой командный интерфейс: здесь доступны Рынок, Кузня и Контракты.' : 'Every region features a Regional Hub. This is your command interface for Markets, Forge, and Contracts.'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. NEW: LOGISTICS & BASES */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Truck className="text-purple-400 w-5 h-5" />
                                <h3 className="text-purple-400 font-bold text-base md:text-lg pixel-text uppercase">4. {isRU ? 'ЛОГИСТИКА И БАЗЫ' : 'LOGISTICS & BASES'}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Hammer className="w-12 h-12" /></div>
                                    <strong className="text-white text-xs block mb-2 uppercase">{isRU ? 'Строительство Аванпостов' : 'Outpost Foundations'}</strong>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                        {isRU
                                            ? 'В свободном секторе можно основать Аванпост. Он расширяет твою сеть влияния, служит складом и позволяет перемещать караваны. Постройка стоит значительных ресурсов.'
                                            : 'Establish Outposts in unclaimed sectors to expand your network. They serve as storage depots and caravan nodes. Construction requires significant resources.'
                                        }
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-900/40 border border-purple-500/20 rounded-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Truck className="w-12 h-12" /></div>
                                    <strong className="text-white text-xs block mb-2 uppercase">{isRU ? 'Шаттлы-Караваны' : 'Caravan Network'}</strong>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                        {isRU
                                            ? 'Позволяют перевозить ресурсы между базами автономно. Это освобождает твой трюм для бурения. Остерегайся: у каждого каравана есть свой Шанс Потери груза!'
                                            : 'Transport cargo between bases autonomously, freeing up your drill\'s bay. Warning: every caravan has a specific Loss Chance depending on the route!'
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 5. NEW: EXPEDITIONS */}
                        <section className="space-y-6 bg-amber-900/5 border border-amber-500/10 p-6 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Cpu className="text-amber-500 w-5 h-5" />
                                <h3 className="text-amber-500 font-bold text-base md:text-lg pixel-text uppercase">5. {isRU ? 'АВТОНОМНЫЕ ЭКСПЕДИЦИИ' : 'DRONE EXPEDITIONS'}</h3>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <p className="text-[11px] text-zinc-400">
                                        {isRU
                                            ? 'Во вкладке "Экспедиции" в Хабе можно отправить группу дронов в дальние биомы за редкими рудами. Это происходит параллельно твоему бурению.'
                                            : 'In the Hub\'s "Expeditions" tab, dispatch drone groups to distant biomes for rare ores. This works in parallel with your primary drilling activity.'
                                        }
                                    </p>
                                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold px-3 py-2 bg-black/40 border border-zinc-800 rounded">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        <span className="text-emerald-400">{isRU ? 'Работают в реальном времени' : 'Runs in real-time'}</span>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl">
                                    <strong className="text-rose-400 text-[10px] block mb-2 uppercase">{isRU ? 'РИСК И СЛОЖНОСТЬ' : 'RISK & DIFFICULTY'}</strong>
                                    <p className="text-[10px] text-zinc-500">
                                        {isRU
                                            ? 'Сложности EXTREME имеют шанс потери всей группы до 70%. Следи за состоянием дронов и не отправляй всех сразу.'
                                            : 'EXTREME difficulties have up to a 70% chance of mission failure. Monitor your drone count and never commit everything to one high-risk run.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 6. ADVANCED SYSTEMS */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Hammer className="text-zinc-100 w-5 h-5" />
                                <h3 className="text-zinc-100 font-bold text-base md:text-lg pixel-text uppercase">6. {isRU ? 'БАЗОВЫЕ ОПЕРАЦИИ' : 'CITY OPERATIONS'}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded-lg">
                                    <h5 className="text-white text-[10px] font-bold uppercase mb-2">Forge (Кузня)</h5>
                                    <p className="text-[10px] text-zinc-500">{isRU ? 'Создавай модули бура и дронов из добытых ресурсов.' : 'Craft drill modules and drones from harvested ores.'}</p>
                                </div>
                                <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded-lg">
                                    <h5 className="text-white text-[10px] font-bold uppercase mb-2">Market (Рынок)</h5>
                                    <p className="text-[10px] text-zinc-500">{isRU ? 'Продавай руду за Кредиты. Цены меняются каждую минуту!' : 'Sell ore for Credits. Prices fluctuate every minute!'}</p>
                                </div>
                                <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded-lg">
                                    <h5 className="text-white text-[10px] font-bold uppercase mb-2">Skills (Навыки)</h5>
                                    <p className="text-[10px] text-zinc-500">{isRU ? 'Прокачивай эффективность бурения в обмен на опыт.' : 'Upgrade drilling efficiency for experience points.'}</p>
                                </div>
                            </div>
                        </section>

                        {/* 7. THE ABYSS */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Skull className="text-rose-500 w-5 h-5" />
                                <h3 className="text-rose-500 font-bold text-base md:text-lg pixel-text uppercase">7. {isRU ? 'БЕЗДНА ЖДЕТ ТЕБЯ' : 'THE ABYSS AWAITS'}</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs md:text-sm text-zinc-400">
                                    {isRU ? 'Глубина скрывает не только камни:' : 'Depth hides more than just stones:'}
                                </p>
                                <ul className="space-y-3 text-[11px] md:text-xs">
                                    <li className="flex gap-3">
                                        <div className="text-rose-500 shrink-0">•</div>
                                        <span><strong>{isRU ? 'Боковые Тоннели' : 'Side Tunnels'}</strong>: {isRU ? 'Опасные ответвления с редкими артефактами. Ограничены по времени!' : 'Dangerous temporal rifts with rare loot. Time-limited!'}</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="text-rose-500 shrink-0">•</div>
                                        <span><strong>{isRU ? 'Стражи Глубин' : 'Deep Guardians'}</strong>: {isRU ? 'Ужасающие боссы-механоиды. Готовь пушки и щиты.' : 'Mechanical bosses protecting the core. Prepare your weapons.'}</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 8. SAVE SYSTEM - CRITICAL */}
                        <section className="relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
                            <div className="relative p-6 md:p-10 border-2 border-red-600 bg-zinc-950 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-red-600 text-white rounded-full"><Save className="w-8 h-8" /></div>
                                    <h3 className="text-red-500 font-bold text-lg md:text-2xl pixel-text uppercase">{isRU ? 'ЖУРНАЛ ЗАПИСИ (RECORD)' : 'CRITICAL: DATA LOGGING'}</h3>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-sm md:text-lg font-bold text-white uppercase tracking-tighter leading-none">
                                        {isRU ? 'В ЭТОЙ ИГРЕ НЕТ АВТО-СОХРАНЕНИЙ!' : 'THIS GAME HAS NO AUTO-SAVE!'}
                                    </p>
                                    <div className="space-y-3 text-xs md:text-sm text-zinc-300">
                                        <div className="flex items-start gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                                            <p>{isRU ? 'Ваш прогресс сохраняется ТОЛЬКО ПРИ НАЖАТИИ КНОПКИ [RECORD]' : 'Progress is only saved WHEN YOU CLICK THE [RECORD] BUTTON'}</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                                            <p>{isRU ? 'Кнопка RECORD находится внутри меню "Settings" (шестеренка внизу).' : 'The RECORD button is located inside the "Settings" menu (gear icon below).'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex items-center gap-3 text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-widest italic">
                                        <AlertCircle className="w-4 h-4" />
                                        {isRU ? 'НЕТ ЗАПИСИ = НЕТ ПРОГРЕССА' : 'NO RECORD = NO PROGRESS'}
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* FOOTER */}
                    <div className="p-4 md:p-6 border-t border-zinc-800 bg-zinc-900/60 z-10 flex justify-end">
                        <button
                            onClick={() => { audioEngine.playUIPanelClose(); onClose(); }}
                            className="w-full md:w-auto px-10 py-4 md:py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black pixel-text text-sm transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase italic"
                        >
                            {isRU ? 'ПРИНЯТЬ И ПОГРУЗИТЬСЯ' : 'ACCEPT & DESCEND'}
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HelpModal;
