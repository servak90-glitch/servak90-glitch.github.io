# Добавляем строки в .gitignore
with open(r'e:\cosmic-excavator_-void-piercer (23)\.gitignore', 'a', encoding='utf-8') as f:
    f.write('\n# Validator outputs\n')
    f.write('validation-report.json\n')
    f.write('progression_metrics.csv\n')
    f.write('progression_charts.png\n')
    f.write('validation-screenshots/\n')
    f.write('scripts/fix_market_scroll.py\n')

print("✅ .gitignore обновлен!")
