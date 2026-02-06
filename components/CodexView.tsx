import React, { useEffect, useState } from 'react';
import { ArtifactDefinition, ArtifactRarity } from '../types';
import { useGameStore } from '../store/gameStore';
import { t, TEXT_IDS, TL } from '../services/localization';
import { ARTIFACTS, getArtifactColor } from '../services/artifactRegistry';
import { audioEngine } from '../services/audioEngine';
import { MONSTER_CODEX } from '../constants/monsters';
import { getQuestById } from '../services/questRegistry';
import { getPartDefinition } from '../store/slices/craftSlice';
import { LogCategory, OperatorId, CrewId } from '../types';
import { OPERATORS, CREW_MEMBERS } from '../constants/rpg';
import {
    Box,
    Skull,
    ScrollText,
    MessageSquare,
    Lock,
    Database,
    Clock,
    Terminal,
    ChevronRight,
    ShieldAlert,
    Wrench,
    CheckCircle2,
    Zap,
    Briefcase,
    Beaker,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FACTION_ICONS: Record<string, React.ReactNode> = {
    'CORPORATE': <Briefcase className="w-3 h-3" />,
    'SCIENCE': <Beaker className="w-3 h-3" />,
    'REBELS': <Users className="w-3 h-3" />
};

const CodexView: React.FC = () => {
    const lang = useGameStore(s => s.settings.language);
    const discoveredArtifacts = useGameStore(s => s.discoveredArtifacts);
    const defeatedBosses = useGameStore(s => s.defeatedBosses);
    const logEntries = useGameStore(s => s.logEntries);
    const activeQuests = useGameStore(s => s.activeQuests);
    const completedQuestIds = useGameStore(s => s.completedQuestIds);
    const craftingQueue = useGameStore(s => s.craftingQueue);
    const operatorId = useGameStore(s => s.operatorId);
    const hiredCrewIds = useGameStore(s => s.hiredCrewIds);

    const [tab, setTab] = useState<'artifacts' | 'monsters' | 'logs' | 'comm' | 'missions' | 'staff'>('artifacts');

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const sortedArtifacts = [...ARTIFACTS].sort((a, b) => {
        const rarityOrder = {
            [ArtifactRarity.COMMON]: 1,
            [ArtifactRarity.RARE]: 2,
            [ArtifactRarity.EPIC]: 3,
            [ArtifactRarity.LEGENDARY]: 4,
            [ArtifactRarity.ANOMALOUS]: 5
        };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    // Stats for header
    const discoveredCount = tab === 'artifacts' ? discoveredArtifacts.length : defeatedBosses.length;
    const totalCount = tab === 'artifacts' ? ARTIFACTS.length : MONSTER_CODEX.length;
    const completionPercent = totalCount > 0 ? Math.floor((discoveredCount / totalCount) * 100) : 0;

    // Filtering Logs
    const filteredLogs = logEntries.filter(entry =>
        tab === 'logs'
            ? (entry.category === LogCategory.SYSTEM || entry.category === LogCategory.TUTORIAL)
            : (entry.category === LogCategory.DIALOG || entry.category === LogCategory.LORE)
    );

    const getTabColor = (currentTab: string) => {
        switch (currentTab) {
            case 'artifacts': return 'cyan';
            case 'monsters': return 'rose';
            case 'logs': return 'emerald';
            case 'comm': return 'amber';
            case 'missions': return 'blue';
            case 'staff': return 'purple';
            default: return 'white';
        }
    };

    const tabColor = getTabColor(tab);

    return (
        <div className="flex-1 flex flex-col bg-void relative h-full overflow-hidden pointer-events-auto">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-${tabColor}-500/5 to-transparent pointer-events-none transition-colors duration-1000`} />

            {/* HEADER HUB */}
            <div className="relative z-10 glass-panel border-x-0 border-t-0 rounded-none pb-6 mb-2 flex flex-col md:flex-row justify-between items-start md:items-end p-6 gap-4 bg-black/40">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Database className={`w-5 h-5 text-${tabColor}-400`} />
                        <h2 className="text-xl md:text-2xl font-black font-technical tracking-tighter text-white uppercase italic">
                            {t(TEXT_IDS.LOGBOOK_TITLE, lang)} // B.J. 4-01
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 glass-panel py-1 px-3 border-white/5 bg-white/5">
                            <span className="text-[10px] text-white/30 font-technical uppercase tracking-widest leading-none">{t(TL.ui.status_label, lang)}:</span>
                            <span className="text-[10px] text-white font-technical font-black uppercase leading-none">{t(TL.ui.accessGranted, lang)}</span>
                        </div>
                    </div>
                </div>

                {(tab === 'artifacts' || tab === 'monsters') && (
                    <div className="flex gap-4">
                        <div className="glass-panel py-3 px-6 border-white/10 bg-white/5 flex flex-col items-center md:items-end min-w-[140px]">
                            <span className="text-[9px] text-white/30 font-technical font-black uppercase tracking-widest mb-1">{t(TL.ui.databaseCoverage, lang)}</span>
                            <div className="flex items-baseline gap-2">
                                <div className="text-2xl font-black font-technical text-white leading-none tabular-nums">
                                    {completionPercent}<span className="text-xs opacity-40 ml-0.5">%</span>
                                </div>
                                <div className="text-[10px] font-technical text-white/20">[{discoveredCount}/{totalCount}]</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TAB NAVIGATOR */}
            <div className="relative z-10 flex px-6 py-2 gap-2 shrink-0 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar touch-pan-x">
                <button
                    onClick={() => setTab('artifacts')}
                    className={`flex items-center gap-2 py-3 px-4 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em] whitespace-nowrap
                        ${tab === 'artifacts' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <Box className="w-3.5 h-3.5" />
                    {t(TL.ui.artifactsVault, lang)}
                </button>
                <button
                    onClick={() => setTab('monsters')}
                    className={`flex items-center gap-2 py-3 px-4 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em] whitespace-nowrap
                        ${tab === 'monsters' ? 'border-rose-400 text-rose-400 bg-rose-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <Skull className="w-3.5 h-3.5" />
                    {t(TL.ui.hostileRegistry, lang)}
                </button>
                <div className="w-px h-6 bg-white/10 self-center mx-1" />
                <button
                    onClick={() => setTab('staff')}
                    className={`flex items-center gap-2 py-3 px-4 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em] whitespace-nowrap
                        ${tab === 'staff' ? 'border-purple-400 text-purple-400 bg-purple-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <Users className="w-3.5 h-3.5" />
                    {lang === 'RU' ? 'ПЕРСОНАЛ' : 'STAFF'}
                </button>
                <div className="w-px h-6 bg-white/10 self-center mx-1" />
                <button
                    onClick={() => setTab('missions')}
                    className={`flex items-center gap-2 py-3 px-4 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em] whitespace-nowrap
                        ${tab === 'missions' ? 'border-blue-400 text-blue-400 bg-blue-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <Zap className="w-3.5 h-3.5" />
                    {t(TEXT_IDS.LOGBOOK_TAB_MISSIONS, lang)}
                </button>
                <button
                    onClick={() => setTab('logs')}
                    className={`flex items-center gap-2 py-3 px-4 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em] whitespace-nowrap
                        ${tab === 'logs' ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <ScrollText className="w-3.5 h-3.5" />
                    {t(TEXT_IDS.LOGBOOK_TAB_LOGS, lang)}
                </button>
                <button
                    onClick={() => setTab('comm')}
                    className={`flex items-center gap-2 py-3 px-4 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em] whitespace-nowrap
                        ${tab === 'comm' ? 'border-amber-400 text-amber-400 bg-amber-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t(TEXT_IDS.LOGBOOK_TAB_COMM, lang)}
                </button>
            </div>

            {/* SCROLLABLE GRID / LIST */}
            <div className="flex-1 overflow-y-auto relative z-10 px-6 py-8 scrolling-auto pb-4 md:pb-8 touch-pan-y">
                <AnimatePresence mode="wait">
                    {tab === 'artifacts' && (
                        <motion.div
                            key="artifacts"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        >
                            {sortedArtifacts.map((def) => {
                                const isDiscovered = discoveredArtifacts.includes(def.id);
                                const colorClass = getArtifactColor(def.rarity);
                                const textColor = colorClass.split(' ')[1];

                                return (
                                    <div
                                        key={def.id}
                                        className={`glass-panel min-h-[260px] p-5 flex flex-col items-center relative group overflow-hidden transition-all duration-500
                                            ${isDiscovered ? `hover:border-cyan-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-white/[0.03]` : 'opacity-40 grayscale blur-[1px]'}
                                        `}
                                    >
                                        <div className="w-full flex justify-between items-center mb-6 z-10">
                                            <span className="text-[8px] font-black font-technical text-white/20 uppercase tracking-widest shrink-0">DEF_ID: {def.id.substring(0, 4)}</span>
                                            {isDiscovered ? (
                                                <div className={`px-2 py-0.5 rounded-full border border-current text-[7px] font-black font-technical uppercase tracking-widest ${textColor}`}>
                                                    {def.rarity}
                                                </div>
                                            ) : <Lock className="w-2.5 h-2.5 text-white/20" />}
                                        </div>

                                        <div className={`flex-1 flex items-center justify-center text-5xl md:text-6xl my-4 relative transition-all duration-700
                                            ${isDiscovered ? 'filter drop-shadow-[0_0_15px_currentColor]' : 'opacity-5 blur-md'}
                                        `}>
                                            {isDiscovered ? def.icon : '❓'}
                                            {isDiscovered && <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent blur-2xl opacity-40 animate-pulse pointer-events-none" />}
                                        </div>

                                        <div className="w-full text-center mt-auto z-10">
                                            <h4 className={`text-[10px] md:text-xs font-black font-technical uppercase tracking-tight mb-2 leading-tight transition-colors ${isDiscovered ? 'text-white group-hover:text-cyan-400' : 'text-white/20'}`}>
                                                {isDiscovered ? t(def.name, lang) : t(TL.ui.unknownSubstance, lang)}
                                            </h4>
                                            {isDiscovered && (
                                                <div className="text-[9px] text-white/30 font-technical leading-relaxed h-[36px] overflow-hidden line-clamp-3 italic">
                                                    "{t(def.loreDescription, lang)}"
                                                </div>
                                            )}
                                        </div>

                                        {/* HOVER DETAIL OVERLAY */}
                                        {isDiscovered && (
                                            <div className="absolute inset-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-6 flex flex-col justify-center text-center z-20 border-t-2 border-cyan-500 overflow-hidden">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent)]" />
                                                <div className={`text-[10px] font-black font-technical uppercase tracking-widest mb-2 ${textColor}`}>{t(def.name, lang)}</div>
                                                <p className="text-[9px] text-white/50 font-technical leading-relaxed mb-4">{t(def.description, lang)}</p>
                                                <div className="w-full h-px bg-white/10 mb-4" />
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">{t(TL.ui.augmentationMod, lang)}:</span>
                                                    <div className="glass-panel p-2 border-emerald-500/20 bg-emerald-500/5 text-[9px] text-emerald-400 font-bold font-technical leading-tight">
                                                        {t(def.effectDescription, lang)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {tab === 'monsters' && (
                        <motion.div
                            key="monsters"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        >
                            {MONSTER_CODEX.map((monster) => {
                                const isDefeated = defeatedBosses.includes(monster.id);

                                return (
                                    <div
                                        key={monster.id}
                                        className={`glass-panel min-h-[260px] p-5 flex flex-col items-center relative group overflow-hidden transition-all duration-500
                                            ${isDefeated ? `hover:border-rose-500 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-white/[0.03]` : 'opacity-40 grayscale blur-[1px]'}
                                        `}
                                    >
                                        <div className="w-full flex justify-between items-center mb-6 z-10">
                                            <span className="text-[8px] font-black font-technical text-white/20 uppercase tracking-widest shrink-0">STRATE_ID: {monster.id.substring(0, 4)}</span>
                                            {isDefeated ? (
                                                <div className="px-2 py-0.5 rounded-full border border-rose-500/50 text-rose-400 text-[7px] font-black font-technical uppercase tracking-widest">
                                                    Tier_{monster.tier}
                                                </div>
                                            ) : <Lock className="w-2.5 h-2.5 text-white/20" />}
                                        </div>

                                        <div className={`flex-1 flex items-center justify-center text-5xl md:text-6xl my-4 relative transition-all duration-700
                                            ${isDefeated ? 'filter drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'opacity-5 blur-md'}
                                        `}>
                                            {isDefeated ? monster.icon : '💀'}
                                        </div>

                                        <div className="w-full text-center mt-auto z-10">
                                            <h4 className={`text-[10px] md:text-xs font-black font-technical uppercase tracking-tight mb-2 leading-tight transition-colors ${isDefeated ? 'text-white group-hover:text-rose-400' : 'text-white/20'}`}>
                                                {isDefeated ? t(monster.name, lang) : t(TL.ui.unknownSpectre, lang)}
                                            </h4>
                                            {isDefeated && (
                                                <div className="text-[9px] text-white/30 font-technical leading-relaxed h-[36px] overflow-hidden line-clamp-3 italic">
                                                    "{t(monster.description, lang)}"
                                                </div>
                                            )}
                                        </div>

                                        {/* HOVER DETAIL OVERLAY */}
                                        {isDefeated && (
                                            <div className="absolute inset-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-6 flex flex-col justify-center text-center z-20 border-t-2 border-rose-500">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.1),transparent)]" />
                                                <div className="text-[10px] font-black font-technical uppercase tracking-widest mb-2 text-rose-400">{t(monster.name, lang)}</div>
                                                <p className="text-[9px] text-white/50 font-technical leading-relaxed mb-4">{t(monster.lore, lang)}</p>
                                                <div className="w-full h-px bg-white/10 mb-4" />
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{t(TL.ui.identifiedWeakness, lang)}:</span>
                                                    <div className="glass-panel py-1 px-4 border-cyan-500/20 bg-cyan-500/5 text-[10px] text-cyan-400 font-bold font-technical uppercase">
                                                        {t((TL as any).weaknesses[monster.weakness], lang) || monster.weakness}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {tab === 'missions' && (
                        <motion.div
                            key="missions"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            className="space-y-12 max-w-5xl mx-auto"
                        >
                            {/* ACTIVE MISSIONS */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30" />
                                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] italic">
                                        {t(TEXT_IDS.LOGBOOK_ACTIVE_MISSIONS, lang)}
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30" />
                                </div>
                                {activeQuests.length === 0 ? (
                                    <div className="text-center py-12 opacity-20 uppercase font-black tracking-widest text-[10px] italic">
                                        [{t(TL.quests.noActive, lang)}]
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeQuests.map(quest => (
                                            <div key={quest.id} className="glass-panel p-6 border-l-4 border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10 transition-colors group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-black text-white uppercase italic tracking-widest leading-none">{t(quest.title, lang)}</h4>
                                                    {quest.factionId && (
                                                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            {FACTION_ICONS[quest.factionId]}
                                                            <span className="text-[8px] font-black uppercase tracking-widest">{t(TL.factions.names[quest.factionId], lang)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[9px] text-zinc-500 font-technical leading-relaxed mb-6">{t(quest.description, lang)}</p>
                                                <div className="space-y-3">
                                                    {quest.objectives.map(obj => {
                                                        const prog = Math.min(100, (obj.current / obj.required) * 100);
                                                        const done = obj.current >= obj.required;
                                                        return (
                                                            <div key={obj.id} className="space-y-1.5">
                                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest font-mono">
                                                                    <span className={done ? 'text-emerald-400' : 'text-zinc-500'}>{t(obj.description, lang)}</span>
                                                                    <span>{obj.current} / {obj.required}</span>
                                                                </div>
                                                                <div className="h-0.5 bg-white/5 overflow-hidden">
                                                                    <div className={`h-full transition-all duration-1000 ${done ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${prog}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* COMPLETED MISSIONS */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] italic">
                                        {t(TEXT_IDS.LOGBOOK_COMPLETED_MISSIONS, lang)}
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                                </div>
                                {completedQuestIds.length === 0 ? (
                                    <div className="text-center py-12 opacity-10 uppercase font-black tracking-widest text-[10px]">
                                        [{t(TL.quests.emptyHistory, lang)}]
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {completedQuestIds.map(id => {
                                            const def = getQuestById(id);
                                            return (
                                                <div key={id} className="glass-panel p-4 flex items-center justify-between border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                                                    <div className="flex items-center gap-6">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-white uppercase italic tracking-widest">{def ? t(def.title, lang) : id}</h5>
                                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{t(TL.ui.contractFulfilled, lang)}</span>
                                                        </div>
                                                    </div>
                                                    {def?.factionId && (
                                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.factions.names[def.factionId], lang)}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {tab === 'staff' && (
                        <motion.div
                            key="staff"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-12 max-w-5xl mx-auto"
                        >
                            {/* Operator Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.5em] italic">
                                        {lang === 'RU' ? 'ГЛАВНЫЙ ОПЕРАТОР' : 'COMMANDING OFFICER'}
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
                                </div>
                                {operatorId ? (() => {
                                    const op = OPERATORS.find(o => o.id === operatorId)!;
                                    return (
                                        <div className="glass-panel p-6 border-l-4 border-l-purple-500 bg-purple-500/5 flex flex-col md:flex-row gap-8">
                                            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 border border-white/10 relative overflow-hidden group">
                                                <img src={op.portraitPath} alt={t(op.name, lang)} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                <div className="absolute bottom-2 left-2 text-[8px] font-mono text-purple-400 uppercase tracking-widest">Active_Duty</div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">{t(op.name, lang)}</h4>
                                                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.2em]">{t(op.passiveBonus, lang)}</div>
                                                </div>
                                                <p className="text-xs text-zinc-400 font-technical leading-relaxed opacity-80 italic">"{t(op.lore, lang)}"</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                    <div className="glass-panel p-3 border-white/5 bg-white/5">
                                                        <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Уникальная черта</div>
                                                        <div className="text-[10px] text-zinc-200 font-technical">{t(op.uniqueTrait, lang)}</div>
                                                    </div>
                                                    <div className="glass-panel p-3 border-white/5 bg-white/5">
                                                        <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Визуальные данные</div>
                                                        <div className="text-[10px] text-zinc-200 font-technical">{t(op.visuals, lang)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <div className="glass-panel p-12 border-dashed flex flex-col items-center justify-center text-zinc-600 uppercase font-black tracking-widest italic opacity-50">
                                        [ОПЕРАТОР НЕ НАЗНАЧЕН]
                                    </div>
                                )}
                            </div>

                            {/* Crew Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] italic">
                                        {lang === 'RU' ? 'ЭКИПАЖ ПОДДЕРЖКИ' : 'SUPPORT CREW'}
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-500/20 to-transparent" />
                                </div>
                                {hiredCrewIds.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-white/5 opacity-20 uppercase font-black tracking-widest text-[10px] italic">
                                        [{lang === 'RU' ? 'ВАКАНСИЙ НЕТ' : 'NO ACTIVE CREW'}]
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {CREW_MEMBERS.filter(c => hiredCrewIds.includes(c.id)).map(crew => (
                                            <div key={crew.id} className="glass-panel p-4 border border-white/5 bg-white/[0.02] flex gap-4 hover:bg-white/[0.04] transition-colors">
                                                <div className="w-16 h-16 shrink-0 border border-white/10 grayscale brightness-75">
                                                    <img src={crew.portraitPath} alt={t(crew.name, lang)} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h5 className="font-black text-white uppercase italic tracking-widest truncate">{t(crew.name, lang)}</h5>
                                                        <span className="text-[8px] font-mono text-zinc-500 px-1 border border-zinc-800">CLASS_{crew.id.substring(0, 2)}</span>
                                                    </div>
                                                    <div className="text-[10px] text-emerald-400 font-bold mb-2">{t(crew.effectDesc, lang)}</div>
                                                    <p className="text-[9px] text-zinc-500 font-technical italic line-clamp-2 leading-tight">"{t(crew.lore, lang)}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {(tab === 'logs' || tab === 'comm') && (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col gap-8 max-w-4xl mx-auto"
                        >
                            {/* ACTIVE CRAFTING SECTION (Only in LOGS tab) */}
                            {tab === 'logs' && craftingQueue.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Wrench className="w-4 h-4 text-emerald-400" />
                                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">
                                            {t(TEXT_IDS.LOGBOOK_ACTIVE_ASSEMBLIES, lang)}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {craftingQueue.map((job) => {
                                            const now = Date.now();
                                            const total = job.completionTime - job.startTime;
                                            const elapsed = now - job.startTime;
                                            const progress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
                                            const def = getPartDefinition(job.partId);
                                            const itemName = def ? (t((def as any).name, lang) || job.partId) : job.partId;

                                            return (
                                                <div key={job.id} className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/10">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{itemName}</span>
                                                        <span className="text-[8px] font-mono text-emerald-400">{Math.floor(progress)}%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-emerald-500"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* LOG ENTRIES */}
                            <div className="flex flex-col gap-2">
                                {filteredLogs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 opacity-30">
                                        <Terminal className="w-12 h-12 mb-4 text-white" />
                                        <h3 className="text-xl font-black font-technical uppercase tracking-widest">
                                            {t(TEXT_IDS.LOGBOOK_NO_ENTRIES, lang)}
                                        </h3>
                                        <p className="font-technical text-white/50 text-xs mt-2">{t(TEXT_IDS.LOGBOOK_EMPTY_BUFFER, lang)}</p>
                                    </div>
                                ) : (
                                    filteredLogs.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className={`glass-panel border-l-4 p-4 flex gap-4 transition-all duration-300
                                                ${entry.category === LogCategory.SYSTEM ? 'border-l-emerald-500/50 bg-emerald-900/10' : ''}
                                                ${entry.category === LogCategory.TUTORIAL ? 'border-l-cyan-500/50 bg-cyan-900/10' : ''}
                                                ${entry.category === LogCategory.DIALOG ? 'border-l-amber-500/50 bg-amber-900/10' : ''}
                                                ${entry.category === LogCategory.LORE ? 'border-l-purple-500/50 bg-purple-900/10' : ''}
                                            `}
                                        >
                                            <div className="flex flex-col items-center gap-1 min-w-[60px] pt-1">
                                                <Clock className="w-3 h-3 text-white/30" />
                                                <span className="text-[8px] font-technical text-white/40 tracking-widest">
                                                    {(entry.timestamp / 3600).toFixed(1)}h
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-xs font-black font-technical uppercase text-white tracking-wide">
                                                        {entry.title}
                                                    </h4>
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-technical uppercase">
                                                        {entry.category}
                                                    </span>
                                                    {!entry.isRead && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />
                                                    )}
                                                </div>
                                                <div className="text-[10px] md:text-xs text-white/70 font-technical leading-relaxed whitespace-pre-wrap">
                                                    {entry.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CodexView;
