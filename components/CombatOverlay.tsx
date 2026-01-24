import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDrillStats, useDrillDynamic, useCombatState, useCombatActions, useDrillActions, useAbilities } from '../store/selectors';
import { formatCompactNumber } from '../services/gameMath';
import { calculateShieldRechargeCost } from '../services/gameMath';
import { abilitySystem } from '../services/systems/AbilitySystem';
import { checkWeakness } from '../services/systems/CombatSystem';
import { AbilityType } from '../types';
import BossOverlay from './BossOverlay';
import { t } from '../services/localization';
import {
    Zap,
    Flame,
    Shield,
    TrendingUp,
    Target,
    Lock,
    BatteryCharging,
    Sword,
    AlertCircle,
    Activity,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CombatOverlayProps {
    onDrillStart: (e: any) => void;
    onDrillEnd: (e: any) => void;
    onRechargeShield: () => void;
}

const AbilityIcons: Record<AbilityType, React.ReactNode> = {
    'EMP_BURST': <Zap className="w-5 h-5" />,
    'THERMAL_STRIKE': <Flame className="w-5 h-5" />,
    'BARRIER': <Shield className="w-5 h-5" />,
    'OVERLOAD': <TrendingUp className="w-5 h-5" />
};

const CombatOverlay: React.FC<CombatOverlayProps> = ({ onDrillStart, onDrillEnd, onRechargeShield }) => {
    const { currentBoss } = useCombatState();
    const { resources } = useDrillStats();
    const { depth, heat, shieldCharge } = useDrillDynamic();
    const { isDrilling } = useDrillActions();

    const lang = useGameStore(s => s.settings.language);
    const { activeAbilities, activateAbility } = useAbilities();
    const { damageWeakPoint } = useCombatActions();

    const rechargeCost = useMemo(() => calculateShieldRechargeCost(depth), [depth]);
    const canAffordRecharge = useMemo(() => resources[rechargeCost.resource] >= rechargeCost.cost, [resources, rechargeCost]);

    if (!currentBoss) return null;

    const hpPercent = (currentBoss.currentHp / currentBoss.maxHp) * 100;
    const isCritical = hpPercent < 25;
    const abilitiesOrder = ['EMP_BURST', 'THERMAL_STRIKE', 'BARRIER', 'OVERLOAD'] as AbilityType[];

    return (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-between p-4 pb-12 overflow-hidden">
            {/* BOSS HUD */}
            <div className="w-full max-w-2xl animate-in slide-in-from-top-8 duration-700 pointer-events-auto">
                <div className={`glass-panel p-5 border-t-2 relative overflow-hidden transition-colors duration-500
                    ${currentBoss.isMob ? 'border-orange-500/50 bg-orange-950/10' :
                        isCritical ? 'border-rose-600 bg-rose-950/20 shadow-[0_0_30px_rgba(225,29,72,0.2)]' : 'border-rose-500/50 bg-rose-950/10'}
                `}>
                    {/* Background Noise Effect */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                    <div className="flex justify-between items-end mb-4 relative z-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Activity className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-500 animate-pulse' : 'text-rose-400/60'}`} />
                                <span className={`text-[10px] font-technical uppercase tracking-[0.3em] ${isCritical ? 'text-rose-500 font-black' : 'text-rose-400/60'}`}>
                                    {isCritical ? 'CRITICAL_INTEGRITY_FAILURE' : 'HIGH_THREAT_ENTITY_DETECTED'}
                                </span>
                            </div>
                            <h2 className={`text-xl md:text-4xl font-black font-technical tracking-tighter uppercase 
                                ${currentBoss.isMob ? 'text-orange-400 neon-text-orange' : 'text-white neon-text-red'}
                            `}>
                                {t(currentBoss.name, lang as 'RU' | 'EN').toUpperCase()}
                            </h2>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] font-technical text-white/40 uppercase tracking-widest mb-1.5">Hull_Structure</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl md:text-3xl font-black font-technical tracking-tighter ${isCritical ? 'text-rose-500' : 'text-white'}`}>
                                    {Math.ceil(hpPercent)}
                                </span>
                                <span className="text-xs font-bold text-rose-500/60">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Pro Segmented HP BAR */}
                    <div className="w-full h-5 md:h-7 bg-black/60 rounded-sm border border-white/10 relative overflow-hidden">
                        {currentBoss.isInvulnerable && (
                            <div className="absolute inset-0 bg-cyan-500/40 z-20 flex items-center justify-center animate-pulse">
                                <Lock className="w-4 h-4 text-white mr-2" />
                                <span className="text-xs font-black text-white tracking-[0.3em]">ARMOR_LOCK_ACTIVE</span>
                            </div>
                        )}

                        {/* HP Segments overlay */}
                        <div className="absolute inset-0 flex gap-[2px] z-10 opacity-30 pointer-events-none">
                            {[...Array(30)].map((_, i) => (
                                <div key={i} className="flex-1 h-full border-r border-black/40" />
                            ))}
                        </div>

                        <div
                            className={`h-full transition-all duration-500 relative shadow-lg
                                ${isCritical ? 'bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400' : 'bg-gradient-to-r from-rose-900 via-rose-600 to-rose-500'}
                            `}
                            style={{ width: `${hpPercent}%` }}
                        >
                            {/* Inner Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* BOSS WEAK POINTS OVERLAY */}
            <BossOverlay onWeakPointClick={damageWeakPoint} />

            {/* STRATEGIC ABILITIES (Floating Bento Right) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 z-40 flex flex-col gap-2 md:gap-4 pointer-events-auto">
                {abilitiesOrder.map((id, idx) => {
                    const def = abilitySystem.getAbilityDef(id);
                    const state = activeAbilities.find(a => a.id === id);
                    const cooldown = state ? state.cooldownRemaining : 0;
                    const isActive = state ? state.isActive : false;
                    const onCooldown = cooldown > 0;
                    if (!def) return null;

                    const isEffective = currentBoss && checkWeakness(currentBoss.type, id);

                    return (
                        <div key={id} className="relative group">
                            <button
                                onClick={() => activateAbility(id)}
                                disabled={onCooldown || isActive}
                                className={`
                                    w-12 h-12 md:w-16 md:h-16 glass-panel flex flex-col items-center justify-center transition-all active:scale-90 relative overflow-hidden group/btn
                                    ${isActive ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.3)]' :
                                        onCooldown ? 'opacity-30 blur-[0.5px] cursor-not-allowed' :
                                            isEffective ? 'border-green-400 bg-green-400/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]' :
                                                'hover:border-white/40 hover:bg-white/10'}
                                `}
                            >
                                <div className={`transition-transform duration-300 group-hover/btn:scale-110 ${isActive ? 'text-yellow-400' : isEffective ? 'text-green-400' : 'text-white/70'} [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5`}>
                                    {AbilityIcons[id]}
                                </div>
                                <span className={`hidden md:block text-[7px] font-black font-technical tracking-widest mt-1.5 ${isActive ? 'text-yellow-400' : 'text-white/20'}`}>
                                    {id.split('_')[0]}
                                </span>

                                {/* Cooldown Overlay */}
                                {onCooldown && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                        <span className="text-sm md:text-xl font-black font-technical text-white/80">{Math.ceil(cooldown / 1000)}</span>
                                    </div>
                                )}

                                {/* Slot Indicator */}
                                <div className="absolute top-1 right-1.5 text-[7px] font-black font-technical text-white/10 uppercase italic">
                                    SYS_{idx + 1}
                                </div>
                            </button>

                            {/* Tooltip Hover Overlay */}
                            <div className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                <div className="glass-panel py-2 px-4 border-white/10 bg-black/80 whitespace-nowrap">
                                    <div className="text-[10px] font-black font-technical text-white uppercase mb-1">{t(def.name as any, lang)}</div>
                                    <div className={`text-[8px] font-bold font-technical ${def.heatCost > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                                        {def.heatCost > 0 ? `Thermal Load: +${def.heatCost}%` : `System Efficiency: ${def.heatCost}%`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACTION CONTROLS HUD */}
            <div className="w-full max-w-4xl flex items-end justify-between pointer-events-auto mt-auto gap-4">

                {/* RECHARGE MODULE */}
                <div className="flex flex-col items-center gap-3 w-32">
                    <button
                        onClick={onRechargeShield}
                        disabled={!canAffordRecharge}
                        className={`
                            group relative w-16 h-16 rounded-full glass-panel flex items-center justify-center transition-all active:scale-95
                            ${canAffordRecharge ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'opacity-20 cursor-not-allowed grayscale'}
                        `}
                    >
                        <BatteryCharging className={`w-8 h-8 transition-transform group-hover:scale-110 ${canAffordRecharge ? 'animate-pulse' : ''}`} />
                        <div className="absolute -bottom-1 glass-panel px-2 py-0.5 border-cyan-500/30 text-[9px] font-black text-white bg-black/80">
                            {rechargeCost.cost > 0 ? formatCompactNumber(rechargeCost.cost) : 'FREE'}
                        </div>
                    </button>
                    <div className="text-center">
                        <span className="text-[9px] font-technical font-black text-cyan-400/40 uppercase tracking-[0.2em] block">Shield_Regen</span>
                    </div>
                </div>

                {/* CENTRAL ATTACK CONSOLE */}
                <div className="relative group">
                    {/* Ring Indicators Container */}
                    <div className="absolute inset-0 -m-8 pointer-events-none">
                        {/* Static Outer Ring */}
                        <div className="absolute inset-0 rounded-full border border-white/5 scale-110" />
                        {/* Dynamic Shield Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 scale-125" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <circle
                                cx="50" cy="50" r="46" fill="none"
                                stroke={shieldCharge < 30 ? '#f43f5e' : isDrilling ? '#22d3ee' : '#3b82f6'}
                                strokeWidth="3"
                                strokeDasharray="289"
                                strokeDashoffset={289 * (1 - shieldCharge / 100)}
                                className="transition-all duration-300"
                                style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                            />
                        </svg>
                    </div>

                    <button
                        className={`
                            w-40 h-40 md:w-52 md:h-52 rounded-full glass-panel border-4 flex flex-col items-center justify-center transition-all active:scale-90 select-none relative z-10 overflow-hidden
                            ${heat > 85 ? 'border-rose-500 bg-rose-500/10 animate-pulse' : 'border-cyan-500/40 bg-white/5'}
                            ${isDrilling ? 'shadow-[0_0_60px_rgba(34,211,238,0.2)]' : ''}
                            ${currentBoss.isInvulnerable ? 'opacity-50 grayscale' : ''}
                        `}
                        onPointerDown={onDrillStart}
                        onPointerUp={onDrillEnd}
                        onPointerLeave={onDrillEnd}
                    >
                        {/* Status Label */}
                        <div className="absolute top-8 text-[9px] font-black font-technical text-white/20 uppercase tracking-[0.4em]">Combat_Link</div>

                        <div className={`my-2 transition-all duration-500 ${isDrilling ? 'scale-125 rotate-[15deg] text-cyan-400' : 'text-white'}`}>
                            {currentBoss.isInvulnerable ? <ShieldAlert className="w-14 h-14" /> : <Sword className="w-16 h-16" />}
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-lg md:text-xl font-black tracking-[0.2em] font-technical text-white uppercase italic">
                                {currentBoss.isInvulnerable ? 'DEFENDING' : isDrilling ? 'STRIKING' : 'STANDBY'}
                            </span>
                            <span className="text-[10px] font-bold font-technical text-cyan-400">
                                {Math.floor(shieldCharge)}% ENERGY
                            </span>
                        </div>

                        {/* Shimmer Effect when active */}
                        {isDrilling && <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent animate-pulse" />}
                    </button>

                    {/* HEAT WARNING */}
                    <AnimatePresence>
                        {heat > 80 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 border-rose-500 bg-rose-500/20 text-rose-500 font-black font-technical text-xs tracking-widest whitespace-nowrap animate-pulse"
                            >
                                <AlertCircle className="w-3.5 h-3.5 inline-block mr-2" />
                                OVERHEAT_WARNING
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SENSOR ARRAY (Diagnostic) */}
                <div className="flex flex-col items-center gap-3 w-32 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center border-rose-500/30">
                        <Target className="w-8 h-8 text-rose-500/60" />
                    </div>
                    <div className="text-center">
                        <span className="text-[9px] font-technical font-black text-rose-400/40 uppercase tracking-[0.2em] block">Sensor_Array</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CombatOverlay;
