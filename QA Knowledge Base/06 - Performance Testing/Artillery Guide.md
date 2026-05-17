# Artillery Guide

> Повний гайд по Artillery: встановлення, конфігурація, типи тестів, просунуті техніки.

#automation #testing #performance #artillery #load

---

## Overview

**Artillery** — Node.js інструмент для навантажувального та функціонального тестування API і вебсервісів. Тести описуються у форматі YAML (без коду) або можна розширити JavaScript.

**Переваги:**
- Простий YAML-синтаксис
- Побудований на Node.js (як Cypress)
- Підтримує HTTP, WebSocket, Socket.io
- Розширюється JS-кодом (processors)
- Відмінний плагін `ensure` для валідації

**Недоліки:**
- Менш потужний за Gatling/k6 при дуже великих навантаженнях
- YAML може бути громіздким для складних сценаріїв

---

## Setup

### Installation

```bash
# Node.js обов'язковий
node -v  # має бути v18+

# Глобальна установка
npm install -g artillery

# Або як dev залежність проєкту
npm install --save-dev artillery

# Перевірка
artillery dino   # виводить ASCII динозаврика 🦖
artillery --version
```

### Project Structure

```
performance-tests/
├── tests/
│   ├── load-test.yml
│   ├── stress-test.yml
│   └── spike-test.yml
├── processors/
│   └── helpers.js
├── data/
│   ├── users.csv
│   └── products.csv
└── package.json
```

---

## Examples

### Minimal Test

```yaml
# test.yml
config:
  target: "https://httpbin.org"
  phases:
    - duration: 10      # 10 секунд
      arrivalRate: 2    # 2 нових юзери/сек
      name: Basic Load

scenarios:
  - name: GET request
    flow:
      - get:
          url: "/get"
```

**Запуск:**
```bash
artillery run test.yml
```

### Full Config Structure

```yaml
config:
  target: "https://api.example.com"

  # Фази навантаження
  phases:
    - duration: 60
      arrivalRate: 5
      name: Warm Up
    - duration: 300
      arrivalRate: 20
      name: Load
    - duration: 60
      arrivalRate: 5
      name: Cool Down

  # HTTP defaults
  http:
    timeout: 30          # секунди
    maxSockets: 0        # unlimited

  # Глобальні змінні
  variables:
    baseUser: "testuser"

  # Валідаційні пороги
  plugins:
    ensure: {}
  ensure:
    thresholds:
      - http.response_time.p95: 500
    conditions:
      - expression: "vusers.failed == 0"

  # Дані з CSV
  payload:
    - path: "data/users.csv"
      fields:
        - "email"
        - "password"
      order: random      # або sequence

  # JS processor
  processor: "processors/helpers.js"

  # Оточення
  environments:
    dev:
      target: "http://localhost:3000"
      phases:
        - duration: 10
          arrivalRate: 1
    staging:
      target: "https://staging.example.com"
      phases:
        - duration: 300
          arrivalRate: 10

# Глобальний before/after (не рахується в метриках)
before:
  flow:
    - post:
        url: "/auth/login"
        json:
          email: "admin@test.com"
          password: "admin123"
        capture:
          - json: "$.accessToken"
            as: "authToken"
        expect:
          - statusCode: 200

after:
  flow:
    - post:
        url: "/auth/logout"
        headers:
          Authorization: "Bearer {{ authToken }}"

scenarios:
  - name: User Journey
    flow:
      - get:
          url: "/products"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200

      - think: 2    # пауза 2 секунди (think time)

      - post:
          url: "/cart"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            productId: 42
            quantity: 1
          capture:
            - json: "$.cartId"
              as: "cartId"
          expect:
            - statusCode: 201

      - log: "Cart ID: {{ cartId }}"

      - get:
          url: "/cart/{{ cartId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

### POST Request with Capture

```yaml
scenarios:
  - name: Login and use token
    flow:
      # Авторизація
      - post:
          url: "/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.accessToken"      # JSONPath
              as: "token"
            - json: "$.user.id"
              as: "userId"
          expect:
            - statusCode: 200

      # Виводимо в термінал для дебагу
      - log: "Token: {{ token }}"
      - log: "User ID: {{ userId }}"

      # Використовуємо токен
      - get:
          url: "/users/{{ userId }}/profile"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
```

### Load Test Types via Phases

```yaml
# Load Test — звичайне навантаження
phases:
  - duration: 1800
    arrivalRate: 10
    name: Load Test

# Stress Test — за межею
phases:
  - duration: 600
    arrivalRate: 50
    name: Stress Test

# Scalability Test — поступово
phases:
  - duration: 300
    arrivalRate: 10
    name: Phase 1
  - duration: 300
    arrivalRate: 20
    name: Phase 2
  - duration: 300
    arrivalRate: 40
    name: Phase 3

# Spike Test — різкий пік
phases:
  - duration: 300
    arrivalRate: 5
    name: Normal
  - duration: 30
    arrivalRate: 100
    name: Spike
  - duration: 300
    arrivalRate: 5
    name: Recovery

# Ramp Up — лінійне зростання
phases:
  - duration: 120
    arrivalRate: 1
    rampTo: 50       # від 1 до 50 за 2 хвилини
    name: Ramp Up
  - duration: 600
    arrivalRate: 50
    name: Sustained

# Endurance / Soak Test
phases:
  - duration: 18000  # 5 годин
    arrivalRate: 5
    name: Endurance
```

### Additional Phase Parameters

```yaml
phases:
  - duration: 60
    arrivalCount: 100   # рівно 100 юзерів за 60 секунд
    name: Exact Count

  - duration: 30
    arrivalRate: 10
    maxVusers: 50       # максимум 50 одночасних юзерів
    name: Capped

  - pause: 10           # пауза 10 секунд між фазами
```

### CSV Data Payload

```csv
# data/users.csv
email,password
user1@test.com,pass1
user2@test.com,pass2
user3@test.com,pass3
```

```yaml
config:
  payload:
    - path: "data/users.csv"
      fields:
        - "email"
        - "password"
      order: sequence    # sequence або random
      skipHeader: true   # якщо є заголовок

scenarios:
  - flow:
      - post:
          url: "/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
```

### JavaScript Processor

```javascript
// processors/helpers.js

// Додати кастомний заголовок до кожного запиту
function addTraceId(requestParams, context, ee, next) {
  requestParams.headers = requestParams.headers || {};
  requestParams.headers['X-Trace-ID'] = `test-${Date.now()}-${Math.random()}`;
  return next();
}

// Згенерувати унікальний email
function generateUser(context, events, done) {
  const id = Math.floor(Math.random() * 1000000);
  context.vars.uniqueEmail = `user_${id}@test.com`;
  context.vars.uniqueName = `User ${id}`;
  return done();
}

// Валідація відповіді
function validateResponse(requestParams, response, context, ee, next) {
  if (response.statusCode !== 200) {
    ee.emit('error', `Unexpected status: ${response.statusCode}`);
  }
  return next();
}

module.exports = {
  addTraceId,
  generateUser,
  validateResponse
};
```

```yaml
config:
  processor: "processors/helpers.js"

scenarios:
  - flow:
      - function: "generateUser"   # виклик функції
      - post:
          url: "/users"
          json:
            email: "{{ uniqueEmail }}"
            name: "{{ uniqueName }}"
          beforeRequest: "addTraceId"
          afterResponse: "validateResponse"
```

---

## Best Practices

1. **Окреме оточення `dev`** для швидкого дебагу (1 юзер, 10 сек)
2. **Прибирай `log` з продакшен-конфігу** — засмічує термінал
3. **`ensure` плагін** для автоматичної валідації SLA
4. **CSV для різноманіття даних** — уникай кешування на сервері
5. **`before`/`after`** для авторизації — не впливає на метрики
6. **Не тестуй з лептопа на Wi-Fi** при великих навантаженнях

---

## Common Errors

| Помилка | Причина | Рішення |
|---------|---------|---------|
| YAML parse error | Неправильні відступи | Перевір yamllint.com |
| `capture` не працює | Неправильний JSONPath | Перевір `$` та шлях |
| Усі запити 0 | Неправильний `target` | Перевір URL + protocol |
| `ensure` fails | Метрики за порогом | Аналізуй результати |
| Rate limited | Забагато запитів | Зменш `arrivalRate` |

---

## CLI Reference

```bash
# Базовий запуск
artillery run test.yml

# Запуск конкретного environment
artillery run -e staging test.yml
artillery run -e load test.yml

# Debug режим
DEBUG=http artillery run test.yml
DEBUG=http,http:response artillery run test.yml

# Зберегти результати у JSON
artillery run --output results.json test.yml

# Генерація HTML звіту
artillery report results.json

# Quick test
artillery quick --count 10 --num 5 https://api.example.com/

# Windows debug
set DEBUG=http
artillery run test.yml
```

---

## Metrics Reference

| Метрика | Що означає |
|---------|-----------|
| `http.codes.200` | Кількість успішних відповідей |
| `http.codes.4xx` | Клієнтські помилки |
| `http.codes.5xx` | Серверні помилки |
| `http.request_rate` | Запитів/сек |
| `http.requests` | Загальна кількість запитів |
| `http.response_time.min` | Найшвидший запит |
| `http.response_time.max` | Найповільніший запит |
| `http.response_time.median` | Медіана |
| `http.response_time.p95` | 95-й перцентиль |
| `http.response_time.p99` | 99-й перцентиль |
| `vusers.created` | Створено віртуальних юзерів |
| `vusers.completed` | Успішно завершили сценарій |
| `vusers.failed` | Невдачі |

---

## Checklist: Навантажувальне тестування

- [ ] Зрозумів очікуване навантаження від бізнесу (concurrent users, req/s)
- [ ] Запустив Load Test з реальними рівнями навантаження
- [ ] Запустив Stress Test для пошуку межі системи
- [ ] Налаштував `ensure` плагін з порогами SLA
- [ ] Створив окремий `local` environment для дебагу (1 юзер, 10 сек)
- [ ] Прибрав `log` команди з продакшен-конфігурації
- [ ] Документуєш результати після кожного запуску (порівнюй з попередніми)
- [ ] Перевірив YAML відступи (yamllint.com) перед запуском

---

## References

- [[Performance Testing Overview]] — загальна теорія
- [[Artillery Cheatsheet]] — швидка шпаргалка
- [[CI-CD Overview]] — інтеграція в пайплайн
- [[API Testing Overview]] — API тестування
- [[Automation Testing Index]] — головна сторінка
