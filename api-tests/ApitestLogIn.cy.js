describe('Login API Tests', () => {

  const URL = 'https://dummyjson.com/auth/login';
  const HEADERS = { 'Content-Type': 'application/json' };

  // ── Happy path ────────────────────────────────────────────────────────────

  it('should login successfully', () => {
    cy.request({
      method: 'POST',
      url: URL,
      headers: HEADERS,
      body: {
        username: 'emilys',
        password: 'emilyspass',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('accessToken');
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('username', 'emilys');
      expect(response.body).to.have.property('email', 'emily.johnson@x.dummyjson.com');
      expect(response.body).to.not.have.property('password');
    });
  });

  // ── Negative: credentials ─────────────────────────────────────────────────

  it('should fail with invalid password', () => {
    cy.request({
      method: 'POST',
      url: URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { username: 'emilys', password: 'wrongpass' },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.not.have.property('accessToken');
    });
  });

  it('should fail with invalid username', () => {
    cy.request({
      method: 'POST',
      url: URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { username: 'wronguser', password: 'emilyspass' },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.not.have.property('accessToken');
    });
  });

  it('should fail with empty password', () => {
    cy.request({
      method: 'POST',
      url: URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { username: 'emilys', password: '' },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.not.have.property('accessToken');
    });
  });

  it('should fail with empty username', () => {
    cy.request({
      method: 'POST',
      url: URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { username: '', password: 'emilyspass' },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.not.have.property('accessToken');
    });
  });

  it('should fail with empty username and password', () => {
    cy.request({
      method: 'POST',
      url: URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { username: '', password: '' },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.not.have.property('accessToken');
    });
  });

  // ── Token tests ───────────────────────────────────────────────────────────

  it('should access protected route with valid token', () => {
    cy.request({
      method: 'POST',
      url: URL,
      headers: HEADERS,
      body: { username: 'emilys', password: 'emilyspass' },
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);

      const token = loginResponse.body.accessToken;
      cy.log('Received token:', token);

      cy.request({
        method: 'GET',
        url: 'https://dummyjson.com/auth/me',
        headers: { Authorization: `Bearer ${token}` },
      }).then((userResponse) => {
        expect(userResponse.status).to.eq(200);
        expect(userResponse.body).to.have.property('username', 'emilys');
        expect(userResponse.body).to.have.property('email');
      });
    });
  });

  it('should fail with invalid token', () => {
    cy.request({
      method: 'GET',
      url: 'https://dummyjson.com/auth/me',
      failOnStatusCode: false,
      headers: { Authorization: 'Bearer invalid_token_123' },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.not.have.property('username');
    });
  });

  it('should fail with empty token', () => {
    cy.request({
      method: 'GET',
      url: 'https://dummyjson.com/auth/me',
      failOnStatusCode: false,
      headers: { Authorization: 'Bearer ' },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.not.have.property('username');
    });
  });

  it('should fail with no Authorization header', () => {
    cy.request({
      method: 'GET',
      url: 'https://dummyjson.com/auth/me',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // ── SQL Injection ─────────────────────────────────────────────────────────
  // Кожна ін'єкція — окремий it(), щоб при падінні одразу видно який payload
  // username та password містять чисту ін'єкцію без валідного логіну попереду

  const injectionStrings = [
    `==`, `=`, `'' --`, `" --`, ` OR 1=1--`, ` #`, ` --`, `/*`, `#`,
    `"/*`, `' and 1='1`, `' and a='a`, ` or 1=1`, ` or true`,
    `' or ''='`, `" or ""="`, `1') and '1'='1`,
    `' AND 1=0 UNION ALL SELECT '', '81dc9bdb52d04dc20036dbd8313ed055`,
    `" AND 1=0 UNION ALL SELECT "", "81dc9bdb52d04dc20036dbd8313ed055`,
    ` and 1=1`, `' and 'one'='one`, `' group by password having 1=1--`,
    `' group by userid having 1=1--`, `' group by username having 1=1--`,
    ` like '%'`, ` or 0=0 --`, ` or 0=0 #`, `' or 0=0 --`, `' or 0=0 #`,
    `" or 0=0 --`, `" or 0=0 #`, `%' or '0'='0`, ` or 1=1--`, ` or 1=1/*`,
    ` or 1=1#`, `' or 1=1--`, `' or '1'='1`, `' or '1'='1'--`,
    `' or '1'='1'/*`, `' or '1'='1'#`, `' or 1=1`, `' or 1=1 --`,
    `' or 1=1--`, `' or 1=1;#`, `' or 1=1/*`, `' or 1=1#`,
    `') or '1'='1`, `') or '1'='1--`, `') or '1'='1'--`, `') or '1'='1'/*`,
    `') or '1'='1'#`, `') or ('1'='1`, `') or ('1'='1--`,
    `') or ('1'='1'--`, `') or ('1'='1'/*`, `') or ('1'='1'#`, `'or'1=1`,
    `" or "1"="1`, `" or "1"="1"--`, `" or "1"="1"/*`, `" or "1"="1"#`,
    `" or 1=1`, `" or 1=1 --`, `" or 1=1--`, `" or 1=1/*`, `" or 1=1#`,
    `") or "1"="1`, `") or "1"="1"--`, `") or "1"="1"/*`, `") or "1"="1"#`,
    `") or ("1"="1`, `") or ("1"="1"--`, `") or ("1"="1"/*`, `") or ("1"="1"#`,
    `') or ('a'='a`, `" or "a"="a`, `") or ("a"="a`,
    `') or ('a'='a and hi") or ("a"="a`, `' or 'one'='one`,
    `' or uid like '%`, `' or uname like '%`, `' or userid like '%`,
    `' or user like '%`, `' or username like '%`, `' or 'x'='x`,
    `') or ('x'='x`, `" or "x"="x`, `' OR 'x'='x'#;`,
    `'=' 'or' and '=' 'or'`, `' UNION ALL SELECT 1, @@version;#`,
    `' UNION ALL SELECT system_user(),user();#`,
    `' UNION select table_schema,table_name FROM information_Schema.tables;#`,
    `admin' and substring(password/text(),1,1)='7`,
    `' and substring(password/text(),1,1)='7`,
    `' or 1=1 limit 1 -- -+`, `'="or'`,
  ];

  injectionStrings.forEach((injection) => {
    it(`SQL injection should be rejected: ${injection}`, () => {
      cy.request({
        method: 'POST',
        url: URL,
        headers: HEADERS,
        failOnStatusCode: false,
        body: {
          username: injection, // ← чиста ін'єкція без валідного username
          password: injection,
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.not.have.property('accessToken');
      });
    });
  });

});
