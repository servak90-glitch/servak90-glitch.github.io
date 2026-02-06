# Финальное исправление скролла на основе отчета Omega Validator

fixes = [
    # BarTab.tsx:522 - fixed inset-0 без overflow
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\BarTab.tsx',
        'old': '<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">',
        'new': '<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto touch-pan-y">'
    },
    # ClinicTab.tsx:159 - fixed inset-0 без overflow
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\city\ClinicTab.tsx',
        'old': '<div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">',
        'new': '<div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 overflow-y-auto touch-pan-y">'
    },
    # ErrorBoundary.tsx:50 - fixed inset-0
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\common\ErrorBoundary.tsx',
        'old': '<div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[9999]">',
        'new': '<div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[9999] overflow-y-auto touch-pan-y">'
    },
    # ErrorBoundary.tsx:62 - overflow-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\common\ErrorBoundary.tsx',
        'old': '<div className="bg-black border border-zinc-800 p-3 mb-4 max-h-32 overflow-auto">',
        'new': '<div className="bg-black border border-zinc-800 p-3 mb-4 max-h-32 overflow-auto touch-pan-y">'
    },
    # DrillStatsPanel.tsx:58 - fixed inset-0
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\DrillStatsPanel.tsx',
        'old': 'className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[190] pointer-events-auto"',
        'new': 'className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[190] pointer-events-auto overflow-y-auto touch-pan-y"'
    },
    # DrillStatsPanel.tsx:83 - overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\DrillStatsPanel.tsx',
        'old': '<div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">',
        'new': '<div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar touch-pan-y">'
    },
    # EquipmentInventoryView.tsx:219 - md:overflow-y-auto (но для мобилки скролл нужен тоже)
    # На самом деле там md:overflow-y-auto, но на мобилках может быть проблема
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\EquipmentInventoryView.tsx',
        'old': '<div className="md:flex-1 bg-gray-950/50 border border-gray-800 rounded-lg rounded-tl-none p-3 md:overflow-y-auto custom-scrollbar">',
        'new': '<div className="md:flex-1 bg-gray-950/50 border border-gray-800 rounded-lg rounded-tl-none p-3 overflow-y-auto md:overflow-y-auto custom-scrollbar touch-pan-y">'
    },
    # EventModal.tsx:81 - overflow-y-auto без touch
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\EventModal.tsx',
        'old': 'max-h-[90vh] overflow-y-auto scrollbar-hide',
        'new': 'max-h-[90vh] overflow-y-auto scrollbar-hide touch-pan-y'
    },
    # GameHeader.tsx:153 - fixed inset-0
    {
        'file': r'e:\cosmic-excavator_-void-piercer (23)\components\layout\GameHeader.tsx',
        'old': 'className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"',
        'new': 'className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-auto overflow-y-auto touch-pan-y"'
    },
]

for fix in fixes:
    try:
        with open(fix['file'], 'r', encoding='utf-8') as f:
            content = f.read()
        
        if fix['old'] in content:
            content = content.replace(fix['old'], fix['new'])
            with open(fix['file'], 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {fix['file'].split('\\')[-1]}")
        else:
            print(f"⚠️  Не найдено в {fix['file'].split('\\')[-1]}")
    except Exception as e:
        print(f"❌Ошибка в {fix['file']}: {e}")
