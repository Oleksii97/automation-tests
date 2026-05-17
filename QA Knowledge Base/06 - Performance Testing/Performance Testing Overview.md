# Performance Testing Overview

> Навантажувальне тестування: типи, метрики, інструменти, стратегії.

#qa #automation #testing #performance #load

---

## Overview

**Performance Testing** — перевірка поведінки системи під навантаженням: швидкості, стабільності, масштабованості. Знаходить вузькі місця до того, як їх знайдуть реальні користувачі.

---

## Types of Performance Tests

| Тип | Опис | Мета |
|-----|------|------|
| **Load Test** | Нормальне очікуване навантаження | Перевірити поведінку за звичайного використання |
| **Stress Test** | Понад нормальне навантаження | Знайти межу системи |
| **Spike Test** | Раптовий різкий пік | Чорна п'ятниця, вірусний трафік |
| **Scalability Test** | Поступове зростання | Розуміти як система масштабується |
| **Volume Test** | Великий обсяг даних | Перевірити БД та storage |
| **Endurance/Soak Test** | Довге навантаження | Виявити memory leaks, resource exhaustion |
| **Spike** | Різкий ріст → різкий спад | Стійкість до піків |

---

## Key Metrics

| Метрика | Опис | Норма |
|---------|------|-------|
| **Response Time** | Час від запиту до відповіді | < 200ms (API), < 3s (Web) |
| **Throughput** | Запитів/секунду | Залежить від SLA |
| **Error Rate** | % невдалих запитів | < 1% |
| **p50 (Median)** | 50% запитів швидше за це | Базова лінія |
| **p95** | 95% запитів швидше | Ключова метрика SLA |
| **p99** | 99% запитів швидше | Worst case для більшості |
| **Concurrent Users** | Одночасні активні юзери | — |
| **CPU/Memory** | Ресурси сервера | < 80% під навантаженням |

> **p95 важливіша за середню**: середнє "маскує" повільні запити. p95 показує реальний досвід більшості.

---

## Performance Testing Tools

| Інструмент | Мова конфігурації | Особливості |
|-----------|------------------|------------|
| **[[Artillery Guide]]** | YAML + JS | Простий старт, Node.js, plugins |
| **k6** | JavaScript | Сучасний, developer-friendly |
| **JMeter** | GUI / XML | Найпопулярніший, Java |
| **Gatling** | Scala / Kotlin | Висока продуктивність |
| **Locust** | Python | Простий, Python-based |
| **wrk** | CLI | Дуже швидкий HTTP benchmark |
| **Vegeta** | Go / CLI | Простий rate limiting |

### Tool Comparison

| Інструмент | Навчальна крива | Потужність | CI/CD |
|-----------|----------------|-----------|-------|
| Artillery | Низька | Середня | Легко |
| k6 | Низька | Висока | Легко |
| JMeter | Висока | Висока | Середньо |
| Gatling | Висока | Дуже висока | Легко |
| Locust | Низька | Середня | Легко |

---

## Performance SLA Examples

```yaml
# Типові SLA для веб-застосунку
- API response time p95 < 500ms
- API response time p99 < 1000ms
- Web page load < 3s
- Error rate < 0.1%
- Throughput > 100 req/s
- System handles 1000 concurrent users
```

---

## Artillery Quick Reference

### Load Test

```yaml
config:
  target: "https://api.example.com"
  phases:
    - duration: 1800   # 30 хвилин
      arrivalRate: 10  # 10 юзерів/сек = 600/хв
      name: Load Test

scenarios:
  - name: API Health Check
    flow:
      - get:
          url: "/api/health"
      - get:
          url: "/api/users"
```

### Stress Test

```yaml
config:
  target: "https://api.example.com"
  phases:
    - duration: 300    # 5 хвилин
      arrivalRate: 2
      rampTo: 50       # поступово до 50/сек
      name: Ramp Up
    - duration: 600
      arrivalRate: 50
      name: Stress
    - duration: 300
      arrivalRate: 50
      rampTo: 2
      name: Ramp Down
```

### Spike Test

```yaml
config:
  target: "https://api.example.com"
  phases:
    - duration: 300
      arrivalRate: 5
      name: Normal Load
    - duration: 30
      arrivalRate: 100    # РІЗКИЙ ПІКС
      name: Spike
    - duration: 300
      arrivalRate: 5
      name: Recovery
```

### With Validation (ensure plugin)

```yaml
config:
  target: "https://api.example.com"
  plugins:
    ensure: {}
  ensure:
    thresholds:
      - http.response_time.p95: 500
      - http.response_time.p99: 1000
    conditions:
      - expression: "vusers.failed == 0"
      - expression: "http.codes.200 >= 1000"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - flow:
      - get:
          url: "/api/products"
```

---

## k6 Quick Reference

```javascript
// k6 test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp up
    { duration: '5m', target: 100 },   // steady state
    { duration: '2m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% < 500ms
    http_req_failed: ['rate<0.01'],     // error rate < 1%
  },
};

export default function () {
  const res = http.get('https://api.example.com/users');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Запуск:**

```bash
k6 run test.js
k6 run --vus 50 --duration 30s test.js  # 50 users, 30 seconds
k6 run --out json=results.json test.js  # export results
```

---

## Performance Testing in CI/CD

```yaml
# GitHub Actions: performance gate
- name: Run Performance Tests
  run: artillery run --output results.json perf-test.yml

- name: Check Performance Results
  run: |
    p95=$(cat results.json | jq '.aggregate.latency.p95')
    if [ "$p95" -gt 500 ]; then
      echo "FAIL: p95 response time ${p95}ms exceeds 500ms threshold"
      exit 1
    fi
    echo "PASS: p95 response time ${p95}ms"
```

---

## Best Practices

1. **Встанови baseline** — спочатку заміряй нормальну поведінку
2. **Тестуй в ізольованому середовищі** — staging, не production
3. **Поступово збільшуй навантаження** — не одразу 1000 юзерів
4. **Моніторь сервер** — CPU, RAM, DB connections, network
5. **Документуй результати** — порівнюй від запуску до запуску
6. **Тестуй реалістичні сценарії** — реальні user journeys
7. **Враховуй think time** — пауза між діями юзера
8. **Не тестуй з одного IP** — може бути rate limited

---

## Related Notes

- [[Artillery Guide]] — повний гайд Artillery
- [[Artillery Cheatsheet]] — швидка шпаргалка
- [[CI-CD Overview]] — інтеграція в пайплайн
- [[API Testing Overview]] — API тести
- [[Automation Testing Index]] — головна сторінка
