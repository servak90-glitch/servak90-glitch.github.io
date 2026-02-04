# СИСТЕМНАЯ ИНСТРУКЦИЯ ДЛЯ РАБОТЫ С ПРОЕКТОМ

> **Версия**: 1.0.0  
> **Дата создания**: 2026-01-16  
> **Проект**: Cosmic Excavator: Void-Piercer

---

## 🎯 ОСНОВНЫЕ ПРИНЦИПЫ

### ПРИНЦИП 1: ПАМЯТЬ ПРЕЖДЕ ВСЕГО
**Каждое значимое изменение ОБЯЗАТЕЛЬНО сохранять в граф памяти.**

✅ **Что сохранять:**
- Новые версии игры → `milestone` entity
- Новые фичи/системы → `feature` entity
- Технические изменения → `technical_change` entity
- Баланс игры → `balance_change` entity
- Важные решения → `observations` к существующим entities

✅ **Когда сохранять:**
- После каждого релиза версии
- После завершения крупной фичи
- После рефакторинга
- После важных решений по дизайну

📝 **Пример использования:**
```typescript
// После добавления новой системы:
mcp_memory_create_entities([{
  entityType: "feature",
  name: "HazardSystem",
  observations: [
    "Система опасностей с типами: Cave-in, Gas, Magma",
    "Интеграция с GameEngine и визуальными эффектами",
    "Файл: services/systems/HazardSystem.ts"
  ]
}])

// Связывание с проектом:
mcp_memory_create_relations([{
  from: "HazardSystem",
  to: "Cosmic Excavator: Void-Piercer",
  relationType: "implemented_in"
}])
```

---

### ПРИНЦИП 2: ДОКУМЕНТАЦИЯ ПЕРЕД КОДОМ
**ОБЯЗАТЕЛЬНО проверять документацию через Context7 перед реализацией.**

✅ **Когда использовать Context7:**
- Работа с React hooks → `query-docs(/facebook/react, "useEffect cleanup")`
- Работа с Zustand → `query-docs(/pmndrs/zustand, "slices pattern")`
- Работа с Pixi.js → `query-docs(/pixijs/pixijs, "graphics rendering")`
- Любая сложная библиотека → сначала `resolve-library-id`, потом `query-docs`

⚠️ **ВАЖНО**: Не более 3 вызовов Context7 на вопрос!

📝 **Пример использования:**
```typescript
// 1. Найти ID библиотеки (если неизвестен)
mcp_context7_resolve-library-id({
  libraryName: "zustand",
  query: "Как создать слайсы в zustand store"
})

// 2. Получить документацию
mcp_context7_query-docs({
  libraryId: "/pmndrs/zustand",
  query: "Slices pattern with TypeScript"
})
```

---

### ПРИНЦИП 3: BRAVE SEARCH ДЛЯ АКТУАЛЬНОЙ ИНФОРМАЦИИ
**Использовать веб-поиск для современных практик и решений.**

✅ **Когда использовать Brave Search:**
- Поиск современных практик (2025+)
- Решение специфических проблем
- Поиск примеров реализации
- Проверка совместимости версий

📝 **Пример использования:**
```typescript
mcp_brave-search_brave_web_search({
  query: "React 19 best practices 2025",
  count: 5
})
```

---

### ПРИНЦИП 4: SEQUENTIAL THINKING ДЛЯ СЛОЖНЫХ ЗАДАЧ
**Использовать пошаговое мышление для анализа и планирования.**

✅ **Когда использовать Sequential Thinking:**
- Сложные архитектурные решения
- Анализ проблем с несколькими аспектами
- Планирование крупных фич
- Проверка гипотез и альтернатив

📝 **Пример использования:**
```typescript
// Шаг 1: Анализ проблемы
mcp_sequential-thinking_sequentialthinking({
  thought: "Анализирую текущую архитектуру GameStore...",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})

// Шаг 2-N: Пошаговое решение
// ...
```

---

### ПРИНЦИП 5: РУССКИЙ ЯЗЫК ВЕЗДЕ
**ВСЁ общение и мышление ТОЛЬКО на русском языке.**

✅ **Что на русском:**
- Все сообщения пользователю
- Все собственные рассуждения
- Комментарии в коде
- Документация и артефакты
- Task boundaries и walkthroughs
- Сохранение в память (observations)

❌ **Исключения:**
- Код (переменные, функции) → английский
- Технические термины → английский, но с пояснением

📝 **Пример:**
```typescript
// ✅ ПРАВИЛЬНО:
// Система опасностей с тремя типами угроз
const hazardTypes = ['cave-in', 'gas', 'magma'];

// ❌ НЕПРАВИЛЬНО:
// Hazard system with three threat types
const hazardTypes = ['cave-in', 'gas', 'magma'];
```

---

### ПРИНЦИП 6: ХРАНЕНИЕ ИДЕЙ СОЗДАТЕЛЯ
**Сохранять идеи «на будущее» в специальный файл, если не требуется немедленная реализация.**

✅ **Когда использовать:**
- Пользователь просит «сохранить идею для последующего внедрения»
- Пользователь уточняет «сейчас делать это не надо»
- Любые предложения по развитию, помеченные как «отложенные»

✅ **Действие:**
1. Записать идею в файл `IDEAS_OF_CREATOR.md`
2. Оформить в виде чек-листа или краткого описания
3. Подтвердить сохранение пользователю

📝 **Пример:**
«Отличная идея, я сохранил её в `IDEAS_OF_CREATOR.md`. Мы вернемся к ней, когда ты дашь команду на реализацию.»

---

## 🔄 WORKFLOW ИНТЕГРАЦИИ MCP

### ШАГ 1: ПОЛУЧЕНИЕ ЗАДАЧИ
```
1. Читаю граф памяти → mcp_memory_read_graph()
2. Понимаю контекст проекта
3. Для сложных задач → mcp_sequential-thinking
```

### ШАГ 2: ИССЛЕДОВАНИЕ
```
1. Нужна документация? → mcp_context7_query-docs()
2. Нужна актуальная информация? → mcp_brave-search_brave_web_search()
3. Нужно протестировать UI? → mcp_puppeteer_*()
```

### ШАГ 3: ПЛАНИРОВАНИЕ
```
1. Создаю implementation_plan.md
2. Использую sequential-thinking для анализа
3. Запрашиваю одобрение через notify_user()
```

### ШАГ 4: РЕАЛИЗАЦИЯ
```
1. Пишу код с комментариями на русском
2. Следую архитектурным принципам
3. Тестирую изменения
```

### ШАГ 5: СОХРАНЕНИЕ В ПАМЯТЬ
```
1. Создаю entities для новых фич → mcp_memory_create_entities()
2. Добавляю observations → mcp_memory_add_observations()
3. Создаю relations → mcp_memory_create_relations()
4. Коммичу в git
```

---

## 📚 БЫСТРАЯ СПРАВКА MCP

### Memory (граф знаний)
- `read_graph()` - читать весь граф
- `create_entities([{...}])` - создать сущности
- `add_observations([{entityName, contents: [...]}])` - добавить наблюдения
- `create_relations([{from, to, relationType}])` - создать связи
- `search_nodes(query)` - поиск в графе

### Context7 (документация)
- `resolve-library-id(libraryName, query)` - найти ID библиотеки
- `query-docs(libraryId, query)` - получить документацию

### Brave Search (веб-поиск)
- `brave_web_search(query, count)` - поиск в вебе
- `brave_local_search(query, count)` - локальный поиск

### Puppeteer (браузер)
- `puppeteer_navigate(url)` - открыть страницу
- `puppeteer_screenshot(name)` - скриншот
- `puppeteer_click(selector)` - клик
- `puppeteer_evaluate(script)` - выполнить JS

### Sequential Thinking (мышление)
- `sequentialthinking({thought, thoughtNumber, totalThoughts, nextThoughtNeeded})`

---

## ✅ ЧЕКЛИСТ ПЕРЕД КАЖДОЙ ЗАДАЧЕЙ

- [ ] Прочитал граф памяти для контекста
- [ ] Проверил Context7 для нужных библиотек
- [ ] Использовал Sequential Thinking для сложных задач
- [ ] Все рассуждения на русском языке
- [ ] Сохранил результаты в память
- [ ] Обновил документацию (CHANGELOG.md, DEV_CONTEXT.json)
- [ ] Закоммитил изменения в git

---

## 🎯 КРИТИЧЕСКИ ВАЖНО

> **НЕ ЗАБЫВАТЬ**: После каждого значимого изменения → сохранить в память!  
> **НЕ ЗАБЫВАТЬ**: Перед реализацией → проверить документацию через Context7!  
> **НЕ ЗАБЫВАТЬ**: Всё общение и рассуждения → только на русском языке!

---

*Эта инструкция создана для максимально эффективной работы с проектом Cosmic Excavator: Void-Piercer с использованием всех доступных MCP инструментов.*
