# Security Testing MOC

> Map of Content для Security Testing: від базових концепцій до інструментів пентестингу.

#security #testing #moc #qa

---

## Overview

Security Testing — це процес виявлення вразливостей, загроз та ризиків у програмному забезпеченні. Мета — захистити дані та функціональність від зловмисників.

---

## Key Areas

### 1. OWASP Top 10
Найпоширеніші вразливості веб-додатків:

| # | Вразливість | Опис |
|---|------------|------|
| A01 | Broken Access Control | Недостатній контроль доступу |
| A02 | Cryptographic Failures | Слабке шифрування / відкриті дані |
| A03 | Injection (SQL, XSS) | Ін'єкції у запити |
| A04 | Insecure Design | Небезпечна архітектура |
| A05 | Security Misconfiguration | Неправильні налаштування безпеки |
| A06 | Vulnerable Components | Вразливі бібліотеки/залежності |
| A07 | Auth Failures | Проблеми автентифікації |
| A08 | Software Integrity Failures | Ненадійні оновлення/pipeline |
| A09 | Logging Failures | Недостатнє логування |
| A10 | SSRF | Server-Side Request Forgery |

### 2. Types of Security Testing

| Тип | Опис |
|-----|------|
| **SAST** | Static Application Security Testing — аналіз коду |
| **DAST** | Dynamic Application Security Testing — тестування запущеного застосунку |
| **IAST** | Interactive AST — комбінація SAST + DAST |
| **Penetration Testing** | Симуляція реальних атак |
| **Vulnerability Scanning** | Автоматичне сканування на вразливості |
| **Security Audit** | Перевірка відповідності стандартам |

### 3. Security Testing в CI/CD
```
Code Commit
    ↓
SAST Scan (SonarQube, Semgrep)
    ↓
Dependency Check (OWASP Dependency Check, Snyk)
    ↓
DAST Scan (OWASP ZAP, Burp Suite)
    ↓
Container Scan (Trivy, Clair)
    ↓
Deploy to Staging
    ↓
Penetration Test (Manual / Automated)
```

---

## Tools

| Інструмент | Тип | Використання |
|-----------|-----|-------------|
| **OWASP ZAP** | DAST | Автоматичне сканування вразливостей |
| **Burp Suite** | DAST / Manual | Перехоплення та аналіз HTTP |
| **Nmap** | Network | Сканування портів та сервісів |
| **Metasploit** | Exploitation | Пентестинг framework |
| **SonarQube** | SAST | Статичний аналіз коду |
| **Snyk** | Dependency | Аналіз вразливостей залежностей |
| **Trivy** | Container | Сканування Docker-образів |
| **Semgrep** | SAST | Пошук патернів вразливостей |
| **Nikto** | Web Scanner | Сканування веб-серверів |

---

## Security Testing Checklist

### API Security
- [ ] Перевірити автентифікацію (JWT, OAuth)
- [ ] Перевірити авторизацію (RBAC, ABAC)
- [ ] Тестувати SQL Injection у параметрах
- [ ] Тестувати XSS у відповідях
- [ ] Перевірити rate limiting
- [ ] Перевірити CORS налаштування
- [ ] Тестувати з недійсними токенами
- [ ] Тестувати з простроченими токенами

### Web Application
- [ ] Перевірити HTTPS / TLS конфігурацію
- [ ] Перевірити заголовки безпеки (CSP, HSTS, X-Frame-Options)
- [ ] Тестувати CSRF захист
- [ ] Перевірити cookies (Secure, HttpOnly, SameSite)
- [ ] Тестувати файловий upload (обмеження типів)
- [ ] Перевірити session management

### Infrastructure
- [ ] Сканування Docker-образів (Trivy)
- [ ] Перевірити secrets у коді (GitLeaks, TruffleHog)
- [ ] Перевірити env variables у CI/CD
- [ ] Аудит залежностей (npm audit, Snyk)

---

## Security Testing with Cypress

```javascript
// Перевірка security headers
it('should have security headers', () => {
  cy.request('/').then(response => {
    expect(response.headers).to.have.property('x-frame-options');
    expect(response.headers).to.have.property('x-content-type-options');
    expect(response.headers['strict-transport-security']).to.exist;
  });
});

// Тестування авторизації
it('should return 401 without token', () => {
  cy.request({
    url: '/api/protected',
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.eq(401);
  });
});

// SQL Injection тест
it('should handle SQL injection in search', () => {
  cy.request({
    url: '/api/search',
    qs: { q: "'; DROP TABLE users; --" },
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.not.eq(500);
    expect(response.body).to.not.contain('SQL');
  });
});
```

---

## References

- [[Security Testing Overview]] — детальний огляд
- [[API Testing Overview]] — безпека API
- [[CI-CD Overview]] — security в пайплайні
- [[DevOps for QA]] — container security
- [[Automation Testing Index]] — головна сторінка

---

## External Resources

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

#todo — додати приклади Burp Suite та OWASP ZAP інтеграції
