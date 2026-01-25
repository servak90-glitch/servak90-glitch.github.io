/**
 * Game Math Extensions for Drones & Bosses
 */

/**
 * Расчет вероятности потери дрона (Модифицированная функция Лапласа)
 * depth: текущая глубина погружения дрона
 * k: коэффициент хардкорности (зависит от биома)
 * maintenance: уровень обслуживания (0.0 - 1.0)
 */
export const calculateDroneRisk = (depth: number, k: number = 0.00001, maintenance: number = 1.0): number => {
    // Базовый риск (5%) увеличивается, если обслуживание плохое
    const baseRisk = 0.05 + (1 - maintenance) * 0.2;

    // Экспоненциальный рост риска от глубины
    const risk = baseRisk + (1 - baseRisk) * (1 - Math.exp(-k * Math.pow(depth, 1.5)));

    // Максимальный риск 95%
    return Math.min(risk, 0.95);
};

/**
 * Генерация случайных уязвимых точек для босса
 */
export const generateWeakPoints = (count: number, width: number, height: number) => {
    const points = [];
    for (let i = 0; i < count; i++) {
        points.push({
            id: `wp_${i}_${Date.now()}`,
            x: (Math.random() - 0.5) * width * 0.8,
            y: (Math.random() - 0.5) * height * 0.8,
            radius: 15 + Math.random() * 10,
            maxHp: 50 + Math.random() * 100,
            currentHp: 0, // Will be set on init
            isActive: true,
            type: Math.random() > 0.9 ? 'CRITICAL' : Math.random() > 0.5 ? 'WEAK' : 'ARMOR'
        });
        points[i].currentHp = points[i].maxHp;
    }
    return points;
};
