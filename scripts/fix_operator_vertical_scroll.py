import re

# Читаем файл
with open(r'e:\cosmic-excavator_-void-piercer (23)\components\overlays\OperatorSelectOverlay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Исправляем главный контейнер: добавляем overflow-y-auto и touch-pan-y, убираем justify-center
content = content.replace(
    'className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700"',
    'className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center p-4 md:p-8 animate-in fade-in duration-700 overflow-y-auto touch-pan-y"'
)

# Записываем обратно
with open(r'e:\cosmic-excavator_-void-piercer (23)\components\overlays\OperatorSelectOverlay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ OperatorSelectOverlay.tsx исправлен (вертикальный скролл)!")
