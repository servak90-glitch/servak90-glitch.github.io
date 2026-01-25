import React from 'react';
import GameHeader from './GameHeader';
import GameFooter from './GameFooter';
import StatusStrip from './StatusStrip';
import ActiveEffects from './ActiveEffects';
import { View } from '../../types';

interface RootLayoutProps {
    children: React.ReactNode;
    activeView: View;
    logs: any[];
    onOpenMenu: () => void;
    onOpenInventory: () => void;
    onOpenRare: () => void;
    isRareOpen: boolean;
    resources: any;
    discoveredArtifactsCount: number;
    lang: string;
}

const RootLayout: React.FC<RootLayoutProps> = ({
    children,
    activeView,
    logs,
    onOpenMenu,
    onOpenInventory,
    onOpenRare,
    isRareOpen,
    resources,
    discoveredArtifactsCount,
    lang
}) => {
    const isHUDVisible = activeView === View.DRILL || activeView === View.COMBAT;

    return (
        <div className="absolute inset-0 z-10 flex flex-col pointer-events-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <GameHeader
                onOpenMenu={onOpenMenu}
                onOpenInventory={onOpenInventory}
                onOpenRare={onOpenRare}
                isRareOpen={isRareOpen}
            />

            {isHUDVisible && <StatusStrip />}
            <ActiveEffects />

            <div className="flex-1 relative min-h-0 pointer-events-none">
                {children}
            </div>

            <GameFooter logs={logs} />
        </div>
    );
};

export default RootLayout;
