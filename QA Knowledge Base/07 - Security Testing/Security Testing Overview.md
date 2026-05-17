# Security Testing Overview

> Тестування безпеки застосунків: OWASP, вразливості, інструменти, підходи.

#qa #automation #testing #security #owasp

---

## Overview

**Security Testing** — виявлення вразливостей, ризиків та загроз у програмному забезпеченні перед тим, як ними скористаються зловмисники.

**Ключове правило**: Security testing — це не одноразова активність, а постійна практика інтегрована в SDLC.

---

## OWASP Top 10 (2021)

| # | Вразливість | Опис | Приклад |
|---|------------|------|---------|
| **A01** | Broken Access Control | Недостатній контроль доступу | Юзер читає дані іншого юзера |
| **A02** | Cryptographic Failures | Слабке шифрування | MD5 для паролів, HTTP замість HTTPS |
| **A03** | Injection | SQL, XSS, Command injection | `' OR 1=1 --` |
| **A04** | Insecure Design | Небезпека на рівні архітектури | Відсутність rate limiting |
| **A05** | Security Misconfiguration | Неправильні налаштування | Default credentials, відкриті порти |
| **A06** | Vulnerable Components | Вразливі залежності | log4shell, OpenSSL |
| **A07** | Auth Failures | Проблеми автентифікації | Weak passwords, no MFA |
| **A08** | Software Integrity | Ненадійні оновлення | Compromised npm packages |
| **A09** | Logging Failures | Недостатнє логування | Атаки без слідів |
| **A10** | SSRF | Server-Side Request Forgery | Атаки через внутрішні сервіси |

---

## Types of Security Testing

### SAST (Static Application Security Testing)
- **Що**: аналіз вихідного коду без виконання
- **Коли**: під час Code Review, в CI/CD на PR
- **Інструменти**: SonarQube, Semgrep, Checkmarx, Snyk Code

```yaml
# GitHub Actions SAST
- name: Run Semgrep
  uses: semgrep/semgrep-action@v1
  with:
    config: p/owasp-top-ten
```

### DAST (Dynamic Application Security Testing)
- **Що**: тестування запущеного застосунку
- **Коли**: на staging/test environment
- **Інструменти**: OWASP ZAP, Burp Suite, Nikto

```bash
# OWASP ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.example.com \
  -r report.html
```

### Penetration Testing
- **Що**: симуляція реальних атак
- **Коли**: перед релізом, щоквартально
- **Хто**: security engineer або зовнішня команда

---

## Common Vulnerabilities & How to Test

### SQL Injection

```javascript
// Test SQL injection attempts
const injectionPayloads = [
  "' OR 1=1 --",
  "'; DROP TABLE users; --",
  "1' UNION SELECT * FROM users --",
  "admin'--",
  "1 OR '1'='1"
];

injectionPayloads.forEach(payload => {
  cy.request({
    url: '/api/login',
    method: 'POST',
    body: { username: payload, password: 'test' },
    failOnStatusCode: false
  }).then(response => {
    // Сервер не повинен повертати 200 або SQL помилки
    expect(response.status).to.not.eq(200);
    expect(response.body).to.not.contain('SQL');
    expect(response.body).to.not.contain('syntax');
  });
});
```

### XSS (Cross-Site Scripting)

```javascript
const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '"><script>alert(1)</script>',
  "javascript:alert(1)"
];

xssPayloads.forEach(payload => {
  cy.request({
    url: '/api/comments',
    method: 'POST',
    body: { content: payload },
    failOnStatusCode: false
  }).then(response => {
    // Payload не повинен бути у відповіді без екранування
    if (response.body.content) {
      expect(response.body.content).to.not.include('<script>');
    }
  });
});
```

### Authentication Testing

```javascript
// Тест без токена
it('should return 401 without auth token', () => {
  cy.request({
    url: '/api/users',
    failOnStatusCode: false
  }).its('status').should('eq', 401);
});

// Тест з невалідним токеном
it('should return 401 with invalid token', () => {
  cy.request({
    url: '/api/users',
    headers: { Authorization: 'Bearer invalid-token-here' },
    failOnStatusCode: false
  }).its('status').should('eq', 401);
});

// IDOR тест (Insecure Direct Object Reference)
it('should not access other user data', () => {
  cy.loginApi('user1@test.com', 'pass1').then(token => {
    cy.request({
      url: '/api/users/999/private',  // чужий ID
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).its('status').should('eq', 403);
  });
});
```

### Security Headers

```javascript
it('should have security headers', () => {
  cy.request('/').then(response => {
    const headers = response.headers;

    // Захист від Clickjacking
    expect(headers).to.have.property('x-frame-options');

    // Захист від MIME-sniffing
    expect(headers['x-content-type-options']).to.eq('nosniff');

    // HTTPS enforcing
    expect(headers).to.have.property('strict-transport-security');

    // CSP (бажано)
    // expect(headers).to.have.property('content-security-policy');
  });
});
```

### Rate Limiting

```javascript
it('should enforce rate limiting', () => {
  const requests = Array.from({ length: 20 }, (_, i) =>
    cy.request({
      url: '/api/login',
      method: 'POST',
      body: { email: 'test@test.com', password: 'wrong' },
      failOnStatusCode: false
    })
  );

  // Після N спроб має бути 429
  cy.request({
    url: '/api/login',
    method: 'POST',
    body: { email: 'test@test.com', password: 'wrong' },
    failOnStatusCode: false
  }).its('status').should('eq', 429);
});
```

---

## Security Testing in CI/CD

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Dependency vulnerability check
      - name: npm audit
        run: npm audit --audit-level=high
      
      # Snyk vulnerability scan
      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      # Secret detection
      - name: GitLeaks scan
        uses: gitleaks/gitleaks-action@v2

  dast:
    runs-on: ubuntu-latest
    needs: [deploy-to-staging]
    steps:
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.9.0
        with:
          target: 'https://staging.example.com'
          rules_file_name: '.zap/rules.tsv'
```

---

## Security Checklist

### API Security
- [ ] Автентифікація на всіх protected endpoints
- [ ] Авторизація (RBAC перевірена)
- [ ] Rate limiting активний
- [ ] CORS правильно налаштований
- [ ] SQL Injection неможливий
- [ ] XSS захист (sanitization, CSP)
- [ ] JWT перевірка підпису та expiry
- [ ] HTTPS обов'язковий

### Data Security
- [ ] Паролі хешовані (bcrypt, argon2)
- [ ] Чутливі дані зашифровані
- [ ] PII не логується
- [ ] Secrets не в коді (env variables)
- [ ] Database credentials обмежені

### Infrastructure
- [ ] Docker образи проскановані (Trivy)
- [ ] OS оновлена, патчі застосовані
- [ ] Мінімальні права (Principle of Least Privilege)
- [ ] Логи безпеки зберігаються

---

## Tools Reference

```bash
# npm audit
npm audit
npm audit fix
npm audit --audit-level=critical

# Snyk
snyk test
snyk monitor

# Trivy (Docker scanning)
trivy image myapp:latest
trivy fs .

# GitLeaks (secret detection)
gitleaks detect --source . --verbose

# OWASP ZAP (manual)
docker run -p 8080:8080 owasp/zap2docker-stable zap.sh -daemon
```

---

## Related Notes

- [[Security Testing MOC]] — карта security testing
- [[API Testing Overview]] — API security
- [[CI-CD Overview]] — security в pipeline
- [[DevOps for QA]] — container security
- [[Automation Testing Index]] — головна сторінка
