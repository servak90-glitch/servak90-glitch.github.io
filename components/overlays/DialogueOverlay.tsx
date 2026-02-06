import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';
import { audioEngine } from '../../services/audioEngine';

export const DialogueOverlay: React.FC = () => {
    const { activeDialogue, settings, chooseDialogueOption, closeDialogue } = useGameStore();
    const lang = settings.language;

    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fullText = activeDialogue && activeDialogue.nodes[activeDialogue.currentNodeId]
        ? t(activeDialogue.nodes[activeDialogue.currentNodeId].text, lang)
        : '';

    const startTyping = (text: string) => {
        setIsTyping(true);
        setDisplayedText('');
        let index = 0;

        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

        typingIntervalRef.current = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(prev => prev + text[index]);
                // Typing sound
                if (index % 2 === 0) {
                    audioEngine.playLog();
                }
                index++;
            } else {
                if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
                setIsTyping(false);
            }
        }, 30);
    };

    useEffect(() => {
        if (!activeDialogue || !activeDialogue.nodes[activeDialogue.currentNodeId]) return;

        startTyping(fullText);
        // Play pager/incoming message sound when node changes
        audioEngine.playPager();

        return () => {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        };
    }, [activeDialogue?.currentNodeId, lang, fullText]);

    const handleSkip = () => {
        if (isTyping) {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
            setDisplayedText(fullText);
            setIsTyping(false);
        }
    };

    if (!activeDialogue) return null;

    const node = activeDialogue.nodes[activeDialogue.currentNodeId];
    if (!node) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 md:p-8 animate-in fade-in duration-500">
            {/* Background Glitch Filter */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/assets/ui/noise.png')] mix-blend-overlay" />

            <div
                className="relative w-full max-w-4xl bg-zinc-900 border-2 border-zinc-700 shadow-2xl flex flex-col md:flex-row min-h-[250px] overflow-hidden"
                onClick={handleSkip}
            >
                {/* CRT Screen Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] opacity-10" />

                {/* Portrait Section */}
                <div className="w-full md:w-1/3 bg-black border-r-2 border-zinc-700 relative overflow-hidden group">
                    <img
                        src={node.portraitPath}
                        alt={t(node.characterName, lang)}
                        className="w-full h-full object-cover grayscale brightness-75 group-hover:brightness-100 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />

                    {/* Character Name Tag */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-tighter mb-1">Incoming Transmission</div>
                        <div className="text-xl font-black text-white uppercase italic skew-x-[-10deg] tracking-tight border-l-4 border-cyan-500 pl-3">
                            {t(node.characterName, lang)}
                        </div>
                    </div>
                </div>

                {/* Text and Choices Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative">
                    <div className="mb-6">
                        <div className="font-mono text-sm text-zinc-300 leading-relaxed min-h-[80px]">
                            {displayedText}
                            {isTyping && <span className="inline-block w-2 h-4 bg-cyan-500 ml-1 animate-pulse" />}
                        </div>
                    </div>

                    {/* Choices */}
                    {!isTyping && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                            {node.choices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        chooseDialogueOption(idx);
                                    }}
                                    className="group relative text-left p-3 border border-zinc-700 hover:border-cyan-500 bg-zinc-800/50 hover:bg-cyan-500/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-cyan-500">[{idx + 1}]</span>
                                        <span className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider">
                                            {t(choice.text, lang)}
                                        </span>
                                    </div>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-2 h-2 bg-cyan-500 rotate-45" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
                    <div className="absolute top-2 right-2 w-4 h-[2px] bg-zinc-600" />
                    <div className="absolute top-2 right-2 w-[2px] h-4 bg-zinc-600" />
                </div>
            </div>
        </div>
    );
};
