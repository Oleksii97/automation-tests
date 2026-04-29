# 🧪 QA Automation Pet Project

[![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)](https://www.cypress.io/)
[![Artillery](https://img.shields.io/badge/Artillery-FF6F61?style=for-the-badge&logo=artillery&logoColor=white)](https://www.artillery.io/)
[![Cucumber](https://img.shields.io/badge/Cucumber-23D96C?style=for-the-badge&logo=cucumber&logoColor=white)](https://cucumber.io/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

> Мій pet-проект з автоматизованого тестування. Тут зібрано приклади E2E, API, performance та BDD тестів — а також персональна шпаргалка з усього стеку.

---

## 📋 Зміст

- [Про проєкт](#-про-проєкт)
- [Технічний стек](#-технічний-стек)
- [Структура репозиторію](#-структура-репозиторію)
- [Як запустити](#-як-запустити)
- [Шпаргалка (PDF)](#-шпаргалка-pdf)
- [Що я вивчив(ла)](#-що-я-вивчивла)
- [Корисні посилання](#-корисні-посилання)

---

## 🎯 Про проєкт

Цей репозиторій — мій навчальний хаб з QA Automation. Тут ти знайдеш:

- ✅ **E2E тести** на Cypress — повноцінні юзер-сценарії з UI
- 🔌 **API тести** на Cypress — перевірка backend без UI
- 🚀 **Performance тести** на Artillery — навантажувальне тестування
- 🥒 **BDD тести** на Cucumber.io — сценарії у форматі Gherkin
- ⚙️ **CI/CD pipeline** — автоматичний запуск через GitHub Actions
- 📚 **Шпаргалка у PDF** — детальний конспект усього вивченого

---

## 🛠 Технічний стек

| Категорія | Інструменти |
|-----------|-------------|
| **E2E / API testing** | Cypress |
| **Performance testing** | Artillery.io |
| **BDD framework** | Cucumber.io + Gherkin |
| **Мова** | JavaScript (ES6+) |
| **Runtime** | Node.js 20.x |
| **Test patterns** | Page Object Pattern, Custom Commands |
| **CI/CD** | GitHub Actions |
| **Контроль версій** | Git, GitHub |

---

## 📂 Структура репозиторію

```
qa-automation-pet-project/
│
├── cypress/                      # E2E + API тести
│   ├── e2e/                      # Тестові сценарії
│   ├── fixtures/                 # Тестові дані (JSON)
│   ├── pages/                    # Page Object Pattern
│   └── support/
│       ├── commands.js           # Власні команди
│       └── e2e.js                # Налаштування E2E
│
├── artillery/                    # Performance тести
│   ├── tests/                    # YAML файли
│   ├── data/                     # CSV з тестовими даними
│   └── processors/               # Кастомні JS-процесори
│
├── cucumber/                     # BDD тести
│   ├── features/                 # .feature файли (Gherkin)
│   │   └── step_definitions/     # Реалізація кроків
│   └── cucumber.js               # Конфігурація
│
├── docs/                         # 📚 Документація
│   └── QA_Cheatsheet.pdf         # Повна шпаргалка
│
├── .github/
│   └── workflows/                # GitHub Actions
│       └── tests.yml
│
├── cypress.config.js             # Конфіг Cypress
├── package.json                  # Залежності та скрипти
└── README.md                     # Цей файл
```

---

## 🚀 Як запустити

### Передумови

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- Браузер Chrome / Firefox / Edge

### Встановлення

```bash
# Клонувати репозиторій
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Встановити залежності
npm install
```

### Запуск Cypress

```bash
# Інтерактивний режим (GUI)
npx cypress open

# Headless у Chrome
npx cypress run -b chrome

# Один конкретний файл
npx cypress run --spec "cypress/e2e/login.cy.js"
```

### Запуск Artillery

```bash
# Базовий тест
artillery run artillery/tests/load-test.yml

# З конкретним environment
artillery run -e load artillery/tests/multi-env.yml

# У debug-режимі
DEBUG=http artillery run artillery/tests/api.yml
```

### Запуск Cucumber

```bash
# Усі тести
npm test

# Тільки smoke
npx cucumber-js --tags '@smoke'

# Виключити skip
npx cucumber-js --tags 'not @skip'
```

---

## 📚 Шпаргалка (PDF)

У папці [`docs/`](./docs/) лежить мій детальний конспект — **65 сторінок** у дизайні terminal-style з прикладами, лайфхаками та чеклістами.

### 🔗 [Завантажити QA Cheatsheet (PDF)](./docs/QA_Cheatsheet.pdf)

**Що всередині:**

| Розділ | Теми |
|--------|------|
| 📚 **Cypress основи** | Встановлення, структура, перший тест |
| 🧱 **Структура тестів** | describe / it, хуки, ізоляція |
| 🛠 **Команди** | visit, get, click, type, contains |
| 🎯 **Селектори** | id, class, attribute, data-cy |
| ✅ **Assertions** | should, and, основні твердження |
| 🧩 **Custom Commands** | DRY-принцип, перевикористання |
| 📄 **Page Object Pattern** | Структура, ООП-принципи |
| 🔌 **API тести** | cy.request, headers, body, cookies |
| 🐛 **Debugging** | console.log, cy.log, debugger |
| 🚀 **Artillery** | Load / Stress / Spike / Endurance |
| 🔄 **CI/CD** | GitHub Actions, Jenkins, pipeline |
| 🥒 **BDD / Cucumber** | Gherkin, step definitions, Background, Tags |

> Шпаргалка створена на основі матеріалів курсу **GoIT QA Automation** і переструктурована для зручної персональної довідки.

---

## 🧠 Що я вивчив(ла)

### Cypress (E2E + API)
- Налаштування проєкту з нуля
- Робота з селекторами і вебелементами
- Написання асертів та перевірок
- Створення власних команд (custom commands)
- Page Object Pattern для масштабованих тестів
- Тестування HTTP API через `cy.request()`
- Debugging API-тестів

### Artillery (Performance)
- Структура YAML-конфігів
- 6 типів навантажувальних тестів (Load, Stress, Spike, Scalability, Volume, Endurance)
- Робота з payload (CSV-дані)
- Hooks (before/after сценаріїв)
- Плагін `ensure` для авто-валідації метрик
- Інтерпретація p95/p99 та інших метрик

### BDD / Cucumber
- Принципи Behavior Driven Development
- Синтаксис Gherkin (Feature, Scenario, Given/When/Then)
- Step Definitions та зв'язок з Gherkin
- Background, Tags, Scenario Outline
- Data Tables та параметризація

### CI/CD
- Базові поняття (CI vs CD, pipeline, artifact)
- GitHub Actions для автотестів
- Тригери (push, PR, schedule)
- Best practices при впровадженні

---

## 🔗 Корисні посилання

- 📖 [Cypress Documentation](https://docs.cypress.io/)
- 🚀 [Artillery Documentation](https://www.artillery.io/docs)
- 🥒 [Cucumber.io Documentation](https://cucumber.io/docs/)
- 📝 [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- ⚙️ [GitHub Actions Docs](https://docs.github.com/en/actions)
- 🎓 [GoIT QA Automation Course](https://goit.global/)

---

## 📬 Контакти

Маєш питання чи пропозиції? Напиши мені:

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your Name](https://linkedin.com/in/your-profile)
- Email: your.email@example.com

---

## 📄 Ліцензія

Цей проєкт використовується в освітніх цілях. Шпаргалка створена на основі матеріалів курсу GoIT та переструктурована для персонального використання.

---

<div align="center">

**⭐ Якщо проєкт був корисним — постав зірочку!**

Made with 💚 by QA Automation enthusiast

</div>
