import re

# Читаем файл
with open(r'e:\cosmic-excavator_-void-piercer (23)\components\overlays\OperatorSelectOverlay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Заменяем строку 66: добавляем touch-pan-x для горизонтального скролла
content = content.replace(
    'className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 w-full lg:w-1/3"',
    'className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 w-full lg:w-1/3 touch-pan-x"'
)

# Записываем обратно
with open(r'e:\cosmic-excavator_-void-piercer (23)\components\overlays\OperatorSelectOverlay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ OperatorSelectOverlay.tsx обновлен!")
