# Список компонентов для исправления скролла на мобильных
fixes = [
    # QuestPanel.tsx - строка 84: overflow-x-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\QuestPanel.tsx',
        'old': 'className="flex w-full lg:w-auto bg-black/60 backdrop-blur-xl p-1 border border-white/5 rounded-sm shrink-0 overflow-x-auto no-scrollbar"',
        'new': 'className="flex w-full lg:w-auto bg-black/60 backdrop-blur-xl p-1 border border-white/5 rounded-sm shrink-0 overflow-x-auto no-scrollbar touch-pan-x"'
    },
    # MarketView.tsx - строка 128: overflow-x-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\MarketView.tsx',
        'old': 'className="flex gap-1 md:gap-2 glass-panel p-1 md:p-2 border-white/5 bg-black/60 shrink-0 overflow-x-auto scrollbar-hide"',
        'new': 'className="flex gap-1 md:gap-2 glass-panel p-1 md:p-2 border-white/5 bg-black/60 shrink-0 overflow-x-auto scrollbar-hide touch-pan-x"'
    },
    # GlobalMapView.tsx - строка 374: overflow-x-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\GlobalMapView.tsx',
        'old': 'className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pointer-events-auto max-w-[70%]"',
        'new': 'className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pointer-events-auto max-w-[70%] touch-pan-x"'
    },
    # FactionPanel.tsx - строка 66: overflow-x-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\FactionPanel.tsx',
        'old': 'className="flex gap-2 md:gap-4 mb-0 md:mb-10 overflow-x-auto pb-2 md:pb-4 no-scrollbar shrink-0 relative z-10"',
        'new': 'className="flex gap-2 md:gap-4 mb-0 md:mb-10 overflow-x-auto pb-2 md:pb-4 no-scrollbar shrink-0 relative z-10 touch-pan-x"'
    },
    # CodexView.tsx - строка 131: overflow-x-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\CodexView.tsx',
        'old': 'className="relative z-10 flex px-6 py-2 gap-2 shrink-0 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar"',
        'new': 'className="relative z-10 flex px-6 py-2 gap-2 shrink-0 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar touch-pan-x"'
    },
    # CityView.tsx - строка 161: overflow-x-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\CityView.tsx',
        'old': 'className="flex bg-black/60 backdrop-blur-md border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth md:shrink-0"',
        'new': 'className="flex bg-black/60 backdrop-blur-md border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth md:shrink-0 touch-pan-x"'
    },
    # BaseView.tsx - строка 162: overflow-x-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\BaseView.tsx',
        'old': 'className="max-w-7xl mx-auto flex gap-1 md:gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1"',
        'new': 'className="max-w-7xl mx-auto flex gap-1 md:gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 touch-pan-x"'
    },
    # SkillsView.tsx - строка 78: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\SkillsView.tsx',
        'old': 'className="flex-1 overflow-y-auto relative z-10 px-4 md:px-6 pb-4 md:pb-32 pt-2 md:pt-4 scrollbar-hide space-y-8 md:space-y-12"',
        'new': 'className="flex-1 overflow-y-auto relative z-10 px-4 md:px-6 pb-4 md:pb-32 pt-2 md:pt-4 scrollbar-hide space-y-8 md:space-y-12 touch-pan-y"'
    },
    # SettingsModal.tsx - строка 157: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\SettingsModal.tsx',
        'old': 'className="p-6 overflow-y-auto scrollbar-hide space-y-8 bg-black/20 max-h-[calc(100vh-150px)] md:max-h-[calc(90vh-120px)]"',
        'new': 'className="p-6 overflow-y-auto scrollbar-hide space-y-8 bg-black/20 max-h-[calc(100vh-150px)] md:max-h-[calc(90vh-120px)] touch-pan-y"'
    },
    # QuestPanel.tsx - строка 94: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\QuestPanel.tsx',
        'old': 'className="flex-1 md:overflow-y-auto no-scrollbar relative z-10"',
        'new': 'className="flex-1 md:overflow-y-auto no-scrollbar relative z-10 touch-pan-y"'
    },
    # GameHeader.tsx - строка 177: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\layout\GameHeader.tsx',
        'old': 'className="flex-1 overflow-y-auto scrollbar-hide py-2 px-1 space-y-6 md:space-y-4"',
        'new': 'className="flex-1 overflow-y-auto scrollbar-hide py-2 px-1 space-y-6 md:space-y-4 touch-pan-y"'
    },
    # GlobalMapView.tsx - строка 224: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\GlobalMapView.tsx',
        'old': 'className="max-w-7xl w-full mx-auto px-4 md:px-10 mt-0 md:mt-4 flex-1 flex flex-col gap-0 md:gap-8 overflow-y-auto min-h-0 pb-0 md:pb-32 scrollbar-hide relative z-10 font-technical"',
        'new': 'className="max-w-7xl w-full mx-auto px-4 md:px-10 mt-0 md:mt-4 flex-1 flex flex-col gap-0 md:gap-8 overflow-y-auto min-h-0 pb-0 md:pb-32 scrollbar-hide relative z-10 font-technical touch-pan-y"'
    },
    # ForgeView.tsx - строка 175: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\ForgeView.tsx',
        'old': 'className="md:flex-1 p-4 md:p-8 md:overflow-y-auto scrollbar-hide pb-4 md:pb-8 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05)_0%,transparent_50%)]"',
        'new': 'className="md:flex-1 p-4 md:p-8 md:overflow-y-auto scrollbar-hide pb-4 md:pb-8 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05)_0%,transparent_50%)] touch-pan-y"'
    },
    # FactionPanel.tsx - строка 98: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\FactionPanel.tsx',
        'old': 'className="flex-1 overflow-y-auto pr-4 scrollbar-hide relative z-10"',
        'new': 'className="flex-1 overflow-y-auto pr-4 scrollbar-hide relative z-10 touch-pan-y"'
    },
    # CodexView.tsx - строка 191: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\CodexView.tsx',
        'old': 'className="flex-1 overflow-y-auto relative z-10 px-6 py-8 scrolling-auto pb-4 md:pb-8"',
        'new': 'className="flex-1 overflow-y-auto relative z-10 px-6 py-8 scrolling-auto pb-4 md:pb-8 touch-pan-y"'
    },
    # CaravanPanel.tsx - строка 67: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\CaravanPanel.tsx',
        'old': 'className="flex-1 flex flex-col gap-0 md:gap-10 font-technical text-white overflow-y-auto pr-0 md:pr-4 scrollbar-hide"',
        'new': 'className="flex-1 flex flex-col gap-0 md:gap-10 font-technical text-white overflow-y-auto pr-0 md:pr-4 scrollbar-hide touch-pan-y"'
    },
    # CaravanPanel.tsx - строка 272: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\CaravanPanel.tsx',
        'old': 'className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-1"',
        'new': 'className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-1 touch-pan-y"'
    },
    # BuildBaseModal.tsx - строка 73: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\BuildBaseModal.tsx',
        'old': 'className="fixed inset-0 z-[120] flex items-center justify-center bg-void/90 backdrop-blur-xl p-3 md:p-6 overflow-y-auto"',
        'new': 'className="fixed inset-0 z-[120] flex items-center justify-center bg-void/90 backdrop-blur-xl p-3 md:p-6 overflow-y-auto touch-pan-y"'
    },
    # BaseView.tsx - строка 182: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\BaseView.tsx',
        'old': 'className="max-w-7xl mx-auto w-full px-4 md:px-10 py-6 md:py-10 flex-1 overflow-y-auto scroll-smooth relative z-10"',
        'new': 'className="max-w-7xl mx-auto w-full px-4 md:px-10 py-6 md:py-10 flex-1 overflow-y-auto scroll-smooth relative z-10 touch-pan-y"'
    },
    # BaseView.tsx - строка 225: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\BaseView.tsx',
        'old': 'className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[300px] max-h-[400px] overflow-y-auto scrollbar-hide content-start"',
        'new': 'className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[300px] max-h-[400px] overflow-y-auto scrollbar-hide content-start touch-pan-y"'
    },
    # BaseView.tsx - строка 253: overflow-y-auto без touch (второе вхождение)
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\BaseView.tsx',
        'old': 'className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[300px] max-h-[400px] overflow-y-auto scrollbar-hide content-start"',
        'new': 'className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[300px] max-h-[400px] overflow-y-auto scrollbar-hide content-start touch-pan-y"',
        'count': 2  # Второе вхождение
    },
    # city/ClinicTab.tsx - строка 38: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\ClinicTab.tsx',
        'old': 'className="flex flex-col h-full bg-gradient-to-b from-zinc-950 to-black p-6 overflow-y-auto"',
        'new': 'className="flex flex-col h-full bg-gradient-to-b from-zinc-950 to-black p-6 overflow-y-auto touch-pan-y"'
    },
    # city/ExpeditionTab.tsx - строка 239: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\ExpeditionTab.tsx',
        'old': 'className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2"',
        'new': 'className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2 touch-pan-y"'
    },
    # city/ExpeditionTab.tsx - строка 319: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\ExpeditionTab.tsx',
        'old': 'className="mt-3 text-[8px] text-zinc-600 font-mono italic px-3 py-2 bg-black/20 border-l-2 border-zinc-800 max-h-12 overflow-y-auto no-scrollbar"',
        'new': 'className="mt-3 text-[8px] text-zinc-600 font-mono italic px-3 py-2 bg-black/20 border-l-2 border-zinc-800 max-h-12 overflow-y-auto no-scrollbar touch-pan-y"'
    },
    # city/LicenseTab.tsx - строка 133: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\LicenseTab.tsx',
        'old': 'className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto no-scrollbar pr-2 pb-4"',
        'new': 'className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto no-scrollbar pr-2 pb-4 touch-pan-y"'
    },
    # city/TradeTab.tsx - строка 82: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\TradeTab.tsx',
        'old': 'className="space-y-3 md:max-h-[300px] md:overflow-y-auto no-scrollbar pr-1"',
        'new': 'className="space-y-3 md:max-h-[300px] md:overflow-y-auto no-scrollbar pr-1 touch-pan-y"'
    },
    # city/TradeTab.tsx - строка 132: overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\TradeTab.tsx',
        'old': 'className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto no-scrollbar pr-2 flex-1 pb-4"',
        'new': 'className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto no-scrollbar pr-2 flex-1 pb-4 touch-pan-y"'
    },
]

# Применяем исправления
for fix in fixes:
    try:
        with open(fix['file'], 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Проверяем, есть ли уже touch-pan в строке
        if 'touch-pan' in fix['old']:
            print(f"⏭️  Пропущено (уже исправлено): {fix['file']}")
            continue
        
        # Заменяем
        if 'count' in fix:
            # Для множественных вхождений
            content = content.replace(fix['old'], fix['new'], fix['count'])
        else:
            content = content.replace(fix['old'], fix['new'])
        
        with open(fix['file'], 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {fix['file'].split('\\')[-1]}")
    except Exception as e:
        print(f"❌ {fix['file'].split('\\')[-1]}: {e}")

print("\n🎉 Все файлы обновлены!")
