/**
 * Скрипт генерации массы equipment для всех типов и тиров
 * Одноразовый скрипт для создания констант массы
 * 
 * Запуск: node scripts/generateEquipmentMass.js
 */

// Формулы расчёта массы из Gemini Chat (v0.3.6)
const FORMULAS = {
  bit: (tier) => Math.round(10 * Math.pow(tier, 0.75)),
  engine: (tier) => Math.round(80 * Math.pow(tier, 0.8)),
  cooling: (tier) => Math.round(30 * Math.pow(tier, 0.7)),
  hull: (tier) => Math.round(500 * Math.pow(tier, 0.875)),
  logic: (tier) => Math.round(5 * Math.pow(tier, 0.6)),
  control: (tier) => Math.round(8 * Math.pow(tier, 0.65)),
  gearbox: (tier) => Math.round(50 * Math.pow(tier, 0.8)),
  power: (tier) => Math.round(100 * Math.pow(tier, 0.85)),
  armor: (tier) => Math.round(150 * Math.pow(tier, 0.9)),
  cargoBay: (tier) => Math.round(200 * Math.pow(tier, 0.85))
};

console.log('='.repeat(60));
console.log('EQUIPMENT MASS GENERATION');
console.log('Generated values for constants.tsx');
console.log('='.repeat(60));
console.log('');

// Генерация для Tiers 1-15
for (const type in FORMULAS) {
  console.log(`\n${type.toUpperCase()}:`);
  console.log('-'.repeat(40));
  
  const values = [];
  for (let tier = 1; tier <= 15; tier++) {
    const mass = FORMULAS[type](tier);
    values.push(mass);
    console.log(`  ${type}_${tier.toString().padStart(2, ' ')}: ${mass.toString().padStart(4, ' ')}кг`);
  }
  
  console.log(`\n  // Массив для копирования:`);
  console.log(`  // mass: [${values.join(', ')}]`);
}

console.log('\n' + '='.repeat(60));
console.log('SUMMARY TABLE');
console.log('='.repeat(60));
console.log('');

// Сводная таблица
console.log('Type      | T1   | T5   | T10  | T15  | Growth Rate');
console.log('----------|------|------|------|------|------------');

for (const type in FORMULAS) {
  const t1 = FORMULAS[type](1);
  const t5 = FORMULAS[type](5);
  const t10 = FORMULAS[type](10);
  const t15 = FORMULAS[type](15);
  const growthRate = (t15 / t1).toFixed(1);
  
  console.log(
    `${type.padEnd(10)}| ${t1.toString().padStart(4)}кг| ${t5.toString().padStart(4)}кг| ${t10.toString().padStart(4)}кг| ${t15.toString().padStart(4)}кг| ${growthRate}x`
  );
}

console.log('\n' + '='.repeat(60));
console.log('TOTAL DRILL MASS ESTIMATES (all slots equipped)');
console.log('='.repeat(60));
console.log('');

// Оценка полной массы бура
for (let tier = 1; tier <= 15; tier += 2) {
  let totalMass = 0;
  for (const type in FORMULAS) {
    totalMass += FORMULAS[type](tier);
  }
  console.log(`Tier ${tier.toString().padStart(2)}: ~${totalMass}кг (полный бур)`);
}

console.log('\n✅ Генерация завершена!');
console.log('📋 Скопируйте значения массы в constants.tsx вручную');
