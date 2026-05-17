# Artillery Cheatsheet

> Швидка шпаргалка по Artillery: YAML структура, фази, метрики, CLI.

#artillery #cheatsheet #performance #load #testing

---

## Installation

```bash
npm install -g artillery
artillery dino           # перевірка
artillery --version
```

---

## CLI Commands

```bash
artillery run test.yml                    # запустити
artillery run -e staging test.yml         # конкретний environment
artillery run --output results.json test.yml  # зберегти результати
artillery report results.json             # HTML звіт
artillery quick -n 10 -c 5 https://url/  # швидкий тест
DEBUG=http artillery run test.yml         # debug
```

---

## YAML Structure

```yaml
config:
  target: "https://api.example.com"
  phases:           # ← обов'язково
    - duration: 60
      arrivalRate: 5
      name: Load
  http:
    timeout: 30
  plugins:
    ensure: {}
  ensure:
    thresholds:
      - http.response_time.p95: 500
    conditions:
      - expression: "vusers.failed == 0"
  payload:          # ← CSV дані
    - path: "users.csv"
      fields: ["email", "password"]
  processor: "helpers.js"
  environments:
    dev:
      phases:
        - { duration: 5, arrivalRate: 1, name: Debug }

before:             # ← не рахується в метрики
  flow:
    - post:
        url: "/auth/login"
        json: { email: "admin@test.com", password: "pass" }
        capture:
          - json: "$.token"
            as: "token"

after:              # ← не рахується в метрики
  flow:
    - get:
        url: "/auth/logout"

scenarios:
  - name: User Journey
    flow:
      - get:
          url: "/products"
          headers:
            Authorization: "Bearer {{ token }}"
      - think: 1
      - post:
          url: "/cart"
          json: { productId: 1 }
          capture:
            - json: "$.cartId"
              as: "cartId"
      - log: "Cart: {{ cartId }}"
```

---

## Phase Types

```yaml
# Load Test
phases:
  - duration: 1800
    arrivalRate: 10
    name: Load Test

# Stress Test
phases:
  - duration: 600
    arrivalRate: 50
    name: Stress

# Ramp Up
phases:
  - duration: 120
    arrivalRate: 1
    rampTo: 50
    name: Ramp Up

# Spike Test
phases:
  - { duration: 300, arrivalRate: 5, name: Normal }
  - { duration: 30, arrivalRate: 100, name: Spike }
  - { duration: 300, arrivalRate: 5, name: Recovery }

# Endurance
phases:
  - duration: 18000   # 5 годин
    arrivalRate: 5
    name: Soak

# Scalability
phases:
  - { duration: 300, arrivalRate: 10, name: Phase 1 }
  - { duration: 300, arrivalRate: 20, name: Phase 2 }
  - { duration: 300, arrivalRate: 40, name: Phase 3 }
```

---

## Phase Parameters

| Параметр | Опис |
|----------|------|
| `duration` | Тривалість в секундах |
| `arrivalRate` | Нових юзерів/сек |
| `rampTo` | Збільшити до N юзерів/сек |
| `arrivalCount` | Всього N юзерів за duration |
| `maxVusers` | Максимум одночасних юзерів |
| `pause` | Пауза між фазами (сек) |

---

## Flow Steps

```yaml
flow:
  - get:
      url: "/endpoint"
      headers:
        Authorization: "Bearer {{ token }}"
      qs:                     # query params
        page: 1
      expect:
        - statusCode: 200
  
  - post:
      url: "/endpoint"
      json:
        key: "value"
        dynamic: "{{ variable }}"
      capture:
        - json: "$.id"
          as: "itemId"
        - header: "X-Request-ID"
          as: "requestId"
  
  - think: 2                  # пауза 2 секунди
  - log: "Value: {{ itemId }}" # вивести в термінал
  - function: "myFunction"    # виклик JS функції
```

---

## Capture (JSONPath)

```yaml
capture:
  - json: "$.token"           # корінь: { "token": "..." }
  - json: "$.user.id"        # вкладений: { "user": { "id": 1 } }
  - json: "$.items[0].name"  # перший елемент масиву
  - json: "$.items.length"   # довжина масиву
  - header: "X-Auth-Token"   # з заголовку
  - regexp: "token=([^&]+)"  # регулярний вираз
    group: 1
    as: "token"
```

---

## Metrics Reference

| Метрика | Що показує |
|---------|-----------|
| `http.codes.200` | Успішні запити |
| `http.codes.4xx` | Клієнтські помилки |
| `http.codes.5xx` | Серверні помилки |
| `http.request_rate` | Запитів/сек |
| `http.requests` | Всього запитів |
| `http.response_time.min` | Мінімальний час |
| `http.response_time.max` | Максимальний час |
| `http.response_time.median` | Медіана |
| `http.response_time.p95` | 95-й перцентиль ← ключова! |
| `http.response_time.p99` | 99-й перцентиль |
| `vusers.created` | Створено юзерів |
| `vusers.completed` | Успішно завершили |
| `vusers.failed` | Невдачі |

---

## Ensure Plugin

```yaml
config:
  plugins:
    ensure: {}
  ensure:
    # Верхні пороги (не перевищувати)
    thresholds:
      - http.response_time.p95: 500
      - http.response_time.p99: 1000
    # Складні умови
    conditions:
      - expression: "vusers.failed == 0"
      - expression: "http.request_rate >= 10"
      - expression: "http.codes.200 > 100 and http.response_time.p95 < 500"
```

---

## CSV Payload

```csv
# data.csv
email,password
user1@test.com,pass1
user2@test.com,pass2
```

```yaml
config:
  payload:
    - path: "data.csv"
      fields:
        - "email"
        - "password"
      order: sequence    # або random
      skipHeader: true
```

---

## JavaScript Processor

```javascript
// processor.js
function beforeRequest(requestParams, context, ee, next) {
  requestParams.headers['X-Custom'] = Date.now().toString();
  return next();
}

function generateData(context, events, done) {
  context.vars.uniqueId = Math.floor(Math.random() * 1000000);
  return done();
}

module.exports = { beforeRequest, generateData };
```

---

## Environments

```yaml
config:
  environments:
    local:
      target: "http://localhost:3000"
      phases:
        - { duration: 5, arrivalRate: 1, name: Debug }
    staging:
      target: "https://staging.example.com"
      phases:
        - { duration: 300, arrivalRate: 10, name: Load }
    stress:
      target: "https://staging.example.com"
      phases:
        - { duration: 600, arrivalRate: 50, name: Stress }
```

```bash
artillery run -e local test.yml
artillery run -e staging test.yml
```

---

## Related Notes

- [[Artillery Guide]] — повний гайд
- [[Performance Testing Overview]] — теорія навантажувального тестування
- [[CI-CD Overview]] — Artillery в CI/CD
