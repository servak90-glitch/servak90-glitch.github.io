import React from 'react';
import { LicenseTabProps } from './types';
import { useGameStore } from '../../store/gameStore';
import { REGIONS, REGION_IDS } from '../../constants/regions';
import { LICENSE_PRICES, PERMIT_PRICES } from '../../constants/licenses';
import { calculatePermitPrice, getRequiredLicense, hasRequiredLicense } from '../../services/licenseManager';
import { t, TEXT_IDS, TL } from '../../services/localization';
import { ZoneLicense, RegionId } from '../../types';
import { AlertTriangle, Gem, GraduationCap } from 'lucide-react';

const LicenseTab: React.FC<LicenseTabProps> = ({ resources }) => {
    const lang = useGameStore(s => s.settings.language);
    const unlockedLicenses = useGameStore(s => s.unlockedLicenses);
    const activePermits = useGameStore(s => s.activePermits);
    const globalReputation = useGameStore(s => s.globalReputation);
    const buyLicense = useGameStore(s => s.buyLicense);
    const buyPermit = useGameStore(s => s.buyPermit);

    const zones: ZoneLicense[] = ['green', 'yellow', 'red'];
    // Regions excluding the starting one (Rust Valley)
    const permitRegions = REGION_IDS.filter(id => id !== RegionId.RUST_VALLEY);

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-12">
            {/* HEADER: SCI-FI BUREAUCRACY */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-500/10 via-white/5 to-zinc-500/10 blur opacity-30"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-white/5 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <div className="h-0.5 w-8 bg-zinc-500" />
                            <h3 className="text-sm font-black text-white tracking-[0.4em] uppercase italic">{t(TEXT_IDS.CITY_LICENSES, lang)}</h3>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono italic max-w-sm">
                            "The Bureau of Subterranean Regulation grants access to restricted geological strata. Violators will be recycled."
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-sm flex flex-col items-center group/rep hover:border-cyan-500/30 transition-all">
                        <span className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Global Standing</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-cyan-400 font-mono tracking-tighter drop-shadow-[0_0_10px_#06b6d4]">{globalReputation}</span>
                            <span className="text-[10px] text-cyan-600 font-mono uppercase">units</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* 1. ZONE LICENSES: VERTICAL STACK */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                        <h4 className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">{t(TEXT_IDS.CITY_LICENSE_ZONE, lang)}</h4>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                    </div>

                    {zones.map(zone => {
                        const isUnlocked = unlockedLicenses.includes(zone);
                        const basePrice = LICENSE_PRICES[zone];
                        const finalPrice = calculatePermitPrice(basePrice, globalReputation);
                        const canAfford = resources.rubies >= finalPrice;

                        // Requirement check for yellow and red
                        let reqMessage = "";
                        let isReqMet = true;
                        if (zone === 'yellow' && !unlockedLicenses.includes('green')) {
                            reqMessage = `GREEN_KEY_REQUIRED`;
                            isReqMet = false;
                        } else if (zone === 'red' && !unlockedLicenses.includes('yellow')) {
                            reqMessage = `YELLOW_KEY_REQUIRED`;
                            isReqMet = false;
                        }

                        const zoneColors = {
                            green: 'from-green-500/20 to-green-900/20 shadow-green-500/20 text-green-400 border-green-500/20',
                            yellow: 'from-yellow-500/20 to-yellow-900/20 shadow-yellow-500/20 text-yellow-400 border-yellow-500/20',
                            red: 'from-red-500/20 to-red-900/20 shadow-red-500/20 text-red-400 border-red-500/20'
                        }[zone];

                        return (
                            <div key={zone} className={`group relative transition-all duration-500 ${isUnlocked ? 'opacity-40 grayscale' : 'hover:scale-[1.02]'}`}>
                                <div className={`absolute -inset-0.5 bg-gradient-to-br ${zoneColors.split(' ').slice(0, 2).join(' ')} blur-sm opacity-20 group-hover:opacity-100 transition duration-500`}></div>
                                <div className="relative bg-black/60 backdrop-blur-md border border-white/5 p-5 md:p-6 flex items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`w-3 h-3 rounded-sm animate-pulse ${zone === 'green' ? 'bg-green-500' : zone === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                            <div className={`text-xs font-black tracking-[0.2em] uppercase ${zone === 'green' ? 'text-green-500' : zone === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
                                                {zone.toUpperCase()} SECTOR CLEARANCE
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed h-8 overflow-hidden">
                                            {zone === 'green' ? 'Standard protocols and surface exploration access.' :
                                                zone === 'yellow' ? 'Industrial sector depth and high-pressure drilling permits.' :
                                                    'Core-level clearance. Anomalous sector entry authorized.'}
                                        </p>
                                    </div>

                                    <div className="w-40">
                                        {isUnlocked ? (
                                            <div className="bg-white/5 border border-white/10 py-3 text-center">
                                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{t(TEXT_IDS.CITY_OWNED, lang)}</span>
                                            </div>
                                        ) : !isReqMet ? (
                                            <div className="text-[8px] text-red-500 font-black uppercase tracking-tighter text-center italic bg-red-950/20 p-2 border border-red-900/30">
                                                <AlertTriangle className="w-3 h-3 inline-block mr-1" /> {reqMessage}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => buyLicense(zone)}
                                                disabled={!canAfford}
                                                className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all
                                                    ${canAfford ? 'bg-white text-black hover:bg-cyan-500 hover:text-white' : 'bg-transparent text-zinc-700 border border-zinc-900 cursor-not-allowed'}`}
                                            >
                                                {finalPrice} <Gem className="w-3.5 h-3.5 inline-block ml-1" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. REGION PERMITS: GRID */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                        <h4 className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">{t(TEXT_IDS.CITY_PERMIT_REGION, lang)}</h4>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto no-scrollbar pr-2 pb-4">
                        {permitRegions.map(regionId => {
                            const region = REGIONS[regionId];
                            const permit = activePermits[regionId];
                            const isPermanent = permit?.type === 'permanent';
                            const requiredLicense = getRequiredLicense(regionId);
                            const hasLicense = hasRequiredLicense(unlockedLicenses, requiredLicense);

                            const prices = PERMIT_PRICES[regionId];
                            const finalPermCost = calculatePermitPrice(prices.perm, globalReputation);
                            const finalTempCost = calculatePermitPrice(prices.temp, globalReputation);

                            return (
                                <div key={regionId} className={`relative group ${isPermanent ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                    <div className="relative bg-white/5 border border-white/5 p-4 md:p-5 hover:bg-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{t(TL.regions[regionId], lang)}</h5>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[7px] font-black px-1.5 py-0.5 border rounded-sm
                                                        ${requiredLicense === 'green' ? 'border-green-500/50 text-green-500' :
                                                            requiredLicense === 'yellow' ? 'border-yellow-500/50 text-yellow-500' : 'border-red-500/50 text-red-500'}`}>
                                                        {requiredLicense.toUpperCase()} REQ
                                                    </span>
                                                </div>
                                            </div>
                                            {isPermanent && <span className="text-[8px] font-black text-cyan-400 border border-cyan-400/50 px-2 py-1">PERMANENT_ACCESS</span>}
                                        </div>

                                        {!isPermanent && (
                                            <div className="flex flex-col gap-2">
                                                {!hasLicense ? (
                                                    <div className="text-[8px] text-zinc-600 font-mono italic uppercase tracking-tighter">
                                                        Insufficient sector clearance for authorization...
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => buyPermit(regionId, 'temporary')}
                                                            disabled={resources.rubies < finalTempCost || finalTempCost === -1}
                                                            className={`py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${resources.rubies >= finalTempCost ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : 'bg-transparent text-zinc-800 border-zinc-900'}`}
                                                        >
                                                            TEMP [{finalTempCost} <Gem className="w-2.5 h-2.5 inline-block" />]
                                                        </button>
                                                        <button
                                                            onClick={() => buyPermit(regionId, 'permanent')}
                                                            disabled={resources.rubies < finalPermCost || finalPermCost === -1}
                                                            className={`py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${resources.rubies >= finalPermCost ? 'bg-white text-black hover:bg-zinc-100' : 'bg-transparent text-zinc-800 border-zinc-900'}`}
                                                        >
                                                            PERM [{finalPermCost} <Gem className="w-2.5 h-2.5 inline-block" />]
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* REQUISITION INFO FOOTER */}
            <div className="relative bg-cyan-950/10 border border-cyan-500/20 p-6 rounded-sm">
                <div className="flex items-center gap-3 text-cyan-500 mb-4">
                    <GraduationCap className="w-6 h-6" />
                    <h5 className="font-black text-[10px] tracking-[0.3em] uppercase italic">Bureau Loyalty Bonus</h5>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono leading-relaxed space-y-2">
                    <p>High <span className="text-white">Global Standing</span> significantly reduces sector processing fees by the bureau.</p>
                    <p>Maximum loyalty discount capped at <span className="text-cyan-400 font-black">30%</span> for veteran excavators.</p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-full bg-[radial-gradient(circle_at_right,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
            </div>
        </div>
    );
};

export default LicenseTab;
