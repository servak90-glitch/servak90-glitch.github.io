#!/usr/bin/env python3
"""
Генератор графиков для метрик прогрессии игры
Использует данные из progression_metrics.csv
"""

import pandas as pd
import matplotlib.pyplot as plt
import sys
from pathlib import Path

def generate_charts(csv_path: str, output_path: str):
    """Генерирует 4 графика из CSV метрик"""
    
    # Загрузка данных
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"❌ Файл {csv_path} не найден!")
        print("Запустите сначала: npm run validate -- --plugin \"Balance Analyzer\"")
        sys.exit(1)
    
    # Создание фигуры с 4 subplot'ами
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 10))
    fig.suptitle('Cosmic Excavator: Progression Metrics', fontsize=16, fontweight='bold')
    
    # График 1: Depth over Time
    ax1.plot(df['Time (s)'], df['Depth (m)'], linewidth=2, color='#FF6B6B')
    ax1.set_title('Глубина бурения', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Время (сек)')
    ax1.set_ylabel('Глубина (м)')
    ax1.grid(True, alpha=0.3)
    ax1.fill_between(df['Time (s)'], df['Depth (m)'], alpha=0.3, color='#FF6B6B')
    
    # График 2: Credits over Time
    ax2.plot(df['Time (s)'], df['Credits'], linewidth=2, color='#4ECDC4')
    ax2.set_title('Накопление кредитов', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Время (сек)')
    ax2.set_ylabel('Кредиты')
    ax2.grid(True, alpha=0.3)
    ax2.fill_between(df['Time (s)'], df['Credits'], alpha=0.3, color='#4ECDC4')
    
    # График 3: Fuel Consumption
    ax3.plot(df['Time (s)'], df['Fuel'], linewidth=2, color='#FFD93D')
    ax3.set_title('Расход топлива', fontsize=14, fontweight='bold')
    ax3.set_xlabel('Время (сек)')
    ax3.set_ylabel('Топливо')
    ax3.grid(True, alpha=0.3)
    ax3.fill_between(df['Time (s)'], df['Fuel'], alpha=0.3, color='#FFD93D')
    
    # График 4: Net Profit Rate
    ax4.bar(df['Time (s)'], df['Net Profit (cred/s)'], width=10, color='#95E1D3', edgecolor='#38A3A5')
    ax4.set_title('Скорость заработка', fontsize=14, fontweight='bold')
    ax4.set_xlabel('Время (сек)')
    ax4.set_ylabel('Прибыль (cred/s)')
    ax4.grid(True, alpha=0.3, axis='y')
    ax4.axhline(y=0, color='red', linestyle='--', linewidth=1, alpha=0.5)
    
    # Улучшение внешнего вида
    plt.tight_layout()
    
    # Сохранение
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✅ Графики сохранены: {output_path}")
    
    # Статистика
    print("\n📊 Статистика:")
    print(f"   Максимальная глубина: {df['Depth (m)'].max():.1f}м")
    print(f"   Итоговые кредиты: {df['Credits'].iloc[-1]:.0f}")
    print(f"   Средняя прибыль: {df['Net Profit (cred/s)'].mean():.2f} cred/s")
    print(f"   Записей в CSV: {len(df)}")

if __name__ == '__main__':
    # Пути по умолчанию
    csv_file = Path('progression_metrics.csv')
    output_file = Path('progression_charts.png')
    
    # Аргументы командной строки
    if len(sys.argv) > 1:
        csv_file = Path(sys.argv[1])
    if len(sys.argv) > 2:
        output_file = Path(sys.argv[2])
    
    generate_charts(str(csv_file), str(output_file))
