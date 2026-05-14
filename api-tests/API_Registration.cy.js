const BASE_URL = 'https://practice.expandtesting.com/notes/api/users/register';
const HEADERS = { 'Content-Type': 'application/json' };

describe('API Register', () => {

  it('should register user successfully', () => {
    const user = {
      name: 'John Doe',
      email: `john_${Date.now()}@example.com`,
      password: 'Password123!'
    };

    cy.request({
      method: 'POST',
      url: BASE_URL,
      headers: HEADERS,
      body: user
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data).to.have.property('id');
      expect(response.body.data.name).to.eq(user.name);
      expect(response.body.data.email).to.eq(user.email);
      expect(response.body.data).to.not.have.property('password');
    });
  });

  it('should fail with empty name', () => {
    cy.request({
      method: 'POST',
      url: BASE_URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { name: '', email: 'johndoe@example.com', password: 'Password123!' }
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail with empty email', () => {
    cy.request({
      method: 'POST',
      url: BASE_URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { name: 'John Doe', email: '', password: 'Password123!' }
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail with empty password', () => {
    cy.request({
      method: 'POST',
      url: BASE_URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { name: 'John Doe', email: 'johndoe@example.com', password: '' }
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail with invalid email format', () => {
    cy.request({
      method: 'POST',
      url: BASE_URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { name: 'John Doe', email: 'not-an-email', password: 'Password123!' }
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail with empty fields', () => {
    cy.request({
      method: 'POST',
      url: BASE_URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { name: '', email: '', password: '' }
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

  it('should fail with too short username', () => {
    cy.request({
      method: 'POST',
      url: BASE_URL,
      headers: HEADERS,
      failOnStatusCode: false,
      body: { name: 'Jo', email: 'johndoe@example.com', password: 'Password123!' }
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message');
    });
  });

    it('should fail with too long username', () => {
        cy.request({
            method: 'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body: { name: 'J'.repeat(51), email: 'johndoe@example.com', password: 'Password123!' }
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message');
        });
    });

    it('should fail with too short password', () => {
        cy.request({
            method: 'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body: { name: 'John Doe', email: 'johndoe@example.com', password: 'Pass' }
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message');
        });
    });

    it('should fail with too long password', () => {
        cy.request({
            method: 'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body: { name: 'John Doe', email: 'johndoe@example.com', password: 'Password123!'.repeat(10) }
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message');
        });
    });

    it('should fail with Password without uppercase', () => {
        cy.request({
            method: 'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body: { name: 'John Doe', email: 'johndoe@example.com', password: 'password123!' }
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        });
    });

    it('should fail with Password without numbers', () => {
        cy.request({
            method: 'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body: { name: 'John Doe', email: 'johndoe@example.com', password: 'Password!' }
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        });
    });

    it('should fail with special chars',() =>{
        cy.request({
            method: 'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body: {name: 'John Doe', email: 'johndoe@example.com', password: 'Password123'}
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        });
    });

    it('should fail with Duplicate email', () => {
    const user = {
        name: 'John Doe',
        email: `duplicate_${Date.now()}@example.com`,
        password: 'Password123!'
    };

  // Перша реєстрація — успішна
  cy.request({
        method: 'POST',
        url: BASE_URL,
        headers: HEADERS,
        body: user,
    }).then((response) => {
        expect(response.status).to.eq(201);
    });

  // Друга реєстрація з тим самим email — має впасти
    cy.request({
            method: 'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body: user,
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body.message).to.eq('An account already exists with the same email address');
        });
    });

    
    it ('should fail with SQL injection in username', () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body:{name: "John' OR 1=1--", email: 'johndoe@example.com', password: 'Password123!'}
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        });
    });

    it ('should fail with XSS attack in username', () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body:{name: "<script>alert('XSS')</script>", email: 'johndoe@exple.com', password: 'Password123!'}
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        });
    });

    it ('should fail with Email case sensitivity', () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body:{name: 'John Doe', email: 'test@test.com', password: 'Password123!'}
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        }); 
    });
    
    it ('should fail with Unicode characters in username', () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body:{name: 'Jos_é', email: 'jose@example.com', password: 'Password123!'}
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        });
    });

    it ("should fail with Missing request body", () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message');
        }); 

    });

    it ("should fail with Missing Content-Type header", () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            failOnStatusCode: false,
            body:{name: 'John Doe', email: 'johndoe@example.com', password: 'Password123!'}
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        }); 

    });

    it ("should fail with Missing Content-Type header", () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            failOnStatusCode: false,
            body:{name: 'John Doe', email: 'johndoe@example.com', password: 'Password123!'}
        }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
        }); 

    });

    it ("should fail with Null values", () => {
        cy.request({
            method:'POST',
            url: BASE_URL,
            headers: HEADERS,
            failOnStatusCode: false,
            body:{name: null, email: 'johndoe@example.com', password: 'Password123!'}
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message');
        }); 
    });

});