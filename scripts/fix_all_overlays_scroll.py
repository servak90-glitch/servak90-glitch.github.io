# Исправление вертикального скролла во всех overlay и modal компонентах

fixes = [
    # SettingsModal.tsx - строка 135: нет overflow-y-auto
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\SettingsModal.tsx',
        'old': 'className="fixed inset-0 z-[200] flex items-center justify-center bg-void/60 backdrop-blur-3xl p-0 md:p-4"',
        'new': 'className="fixed inset-0 z-[200] flex items-center justify-center bg-void/60 backdrop-blur-3xl p-0 md:p-4 overflow-y-auto touch-pan-y"'
    },
    # RegionalHubOverlay.tsx - строка 76: нет overflow-y-auto
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\overlays\RegionalHubOverlay.tsx',
        'old': 'className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"',
        'new': 'className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md overflow-y-auto touch-pan-y"'
    },
    # DialogueOverlay.tsx - строка 66: нет overflow-y-auto
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\overlays\DialogueOverlay.tsx',
        'old': 'className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 md:p-8 animate-in fade-in duration-500"',
        'new': 'className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 md:p-8 animate-in fade-in duration-500 overflow-y-auto touch-pan-y"'
    },
    # MenuOverlay.tsx - строка 29: нет overflow-y-auto
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\MenuOverlay.tsx',
        'old': 'className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md"',
        'new': 'className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-y-auto touch-pan-y"'
    },
    # HelpModal.tsx - строка 29: нет overflow-y-auto
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\HelpModal.tsx',
        'old': 'className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-4"',
        'new': 'className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-4 overflow-y-auto touch-pan-y"'
    },
    # EventModal.tsx - строка 74: нет overflow-y-auto
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\EventModal.tsx',
        'old': 'className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"',
        'new': 'className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto touch-pan-y"'
    },
]

# Применяем исправления
for fix in fixes:
    try:
        with open(fix['file'], 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Проверяем, есть ли уже touch-pan в строке
        if 'touch-pan' in fix['old']:
            print(f"⏭️  Пропущено (уже исправлено): {fix['file'].split(chr(92))[-1]}")
            continue
        
        # Заменяем
        if fix['old'] in content:
            content = content.replace(fix['old'], fix['new'])
            
            with open(fix['file'], 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {fix['file'].split(chr(92))[-1]}")
        else:
            print(f"⚠️  Не найдено: {fix['file'].split(chr(92))[-1]}")
    except Exception as e:
        print(f"❌ {fix['file'].split(chr(92))[-1]}: {e}")

print("\n🎉 Все overlay и modal обновлены!")
