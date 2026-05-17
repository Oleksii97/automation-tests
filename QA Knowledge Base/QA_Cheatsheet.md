# QA Automation Cheat Sheet (Original)

> Оригінальна шпаргалка по: **Cypress · API Testing · Page Object · Artillery · CI/CD · BDD / Cucumber**

#cypress #artillery #bdd #cucumber #cicd #automation #testing #cheatsheet

---

> Весь контент цього файлу систематизований та розширений у базі знань.
> Для навігації використовуй [[Automation Testing Index]].

---

## Зміст → Нові нотатки

| Тема з оригіналу | Нова нотатка | Деталі |
|-----------------|-------------|--------|
| Cypress — знайомство | [[Cypress Guide]] | Повний гайд з прикладами |
| Структура тесту | [[Cypress Guide]] | describe/it/hooks |
| Базові команди | [[Cypress Cheatsheet]] | Всі команди в одному місці |
| Селектори | [[UI Testing Overview]] | + порівняння типів |
| Assertions | [[Cypress Cheatsheet]] | should/and reference |
| Page Object Pattern | [[Page Object Pattern]] | Cypress + Playwright + Selenium |
| API тестування | [[API Testing with Cypress]] | cy.request() повний гайд |
| HTTP запити | [[API Testing Overview]] | HTTP методи, status codes |
| Artillery — основи | [[Artillery Guide]] | Повний гайд |
| Artillery — типи тестів | [[Artillery Cheatsheet]] | YAML приклади |
| CI/CD концепції | [[CI-CD Overview]] | Теорія + pipeline |
| GitHub Actions | [[GitHub Actions Guide]] | Практичні приклади |
| BDD / Cucumber | [[BDD and Cucumber]] | Повний гайд |
| Gherkin синтаксис | [[Gherkin Syntax]] | Повний довідник |
| Міні-шпаргалки | [[Cypress Cheatsheet]], [[Artillery Cheatsheet]], [[Cucumber Cheatsheet]], [[CI-CD Cheatsheet]] | Окремі cheatsheets |
| Чекліст QA Engineer | [[QA Automation Interview Questions]] | + питання для співбесід |

---

## Швидкий Доступ

### Cypress

```bash
npm install cypress --save-dev
npx cypress open         # GUI
npx cypress run          # headless
npx cypress run -b chrome --headed
npx cypress run --spec "cypress/e2e/login.cy.js"
```

### Artillery

```bash
npm install -g artillery
artillery run test.yml
artillery run -e staging test.yml
artillery run --output results.json test.yml
artillery report results.json
```

### Cucumber

```bash
npm install --save-dev @cucumber/cucumber
npx cucumber-js
npx cucumber-js --tags '@smoke'
npx cucumber-js --tags 'not @skip'
```

### GitHub Actions (мінімальний)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - uses: cypress-io/github-action@v6
```

---

## Навігація

- [[Automation Testing Index]] — головна сторінка
- [[QA Automation MOC]] — карта автоматизації
- [[Cypress Guide]] — Cypress детально
- [[Artillery Guide]] — Artillery детально
- [[BDD and Cucumber]] — BDD та Cucumber
- [[CI-CD Overview]] — CI/CD
- [[Learning Roadmap]] — шлях розвитку
