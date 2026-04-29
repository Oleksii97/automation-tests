describe('Login API Tests', () => {
  it('should login successfully', () => {
    cy.request({
      method: 'POST',
      url: 'https://dummyjson.com/auth/login',
      failOnStatusCode: false,
      body: {
        username: 'emilys',
        password: 'emilyspass',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('accessToken')
      expect(response.body).to.have.property('id')
      expect(response.body).to.have.property('username', 'emilys')
      expect(response.body).to.have.property('email', 'emily.johnson@x.dummyjson.com')
      
    })
  })


it('Log in with Invalid password', () => {
    cy.request({
      method: 'POST',
      url: 'https://dummyjson.com/auth/login',
      failOnStatusCode: false,
      body: {
        username: 'emilys',
        password: 'wrongpass',
      },
    }).then((response) => {
      expect(response.status).to.eq(400)

    })
  })


  it('Log in with an Invalid username', () => {
    cy.request({
      method: 'POST',
      url: 'https://dummyjson.com/auth/login',
      failOnStatusCode: false,
      body: {
        username: 'wronguser',
        password: 'emilyspass',
      },
    }).then((response) => {
      expect(response.status).to.eq(400)

    })
  })


  it('Log in with Empty password', () => {
    cy.request({
      method: 'POST',
      url: 'https://dummyjson.com/auth/login',
      failOnStatusCode: false,
      body: {
        username: 'emilys',
        password: '',
      },
    }).then((response) => {
      expect(response.status).to.eq(400)

    })
  })



  it('Log in with Empty username', () => {
    cy.request({
      method: 'POST',
      url: 'https://dummyjson.com/auth/login',
      failOnStatusCode: false,
      body: {
        username: '',
        password: 'emilyspass',
      },
    }).then((response) => {
      expect(response.status).to.eq(400)

    })
  })


  it('Log in with Empty username and password', () => {
    cy.request({
      method: 'POST',
      url: 'https://dummyjson.com/auth/login',
      failOnStatusCode: false,
      body: {
        username: '',
        password: '',
      },
    }).then((response) => {
      expect(response.status).to.eq(400)

    })
  })



  it('Log in with a valid token', () => {

    // 1. логін
    cy.request({
      method: 'POST',
      url: 'https://dummyjson.com/auth/login',
      body: {
        username: 'emilys',
        password: 'emilyspass'
      }
    }).then((loginResponse) => {

      expect(loginResponse.status).to.eq(200)

      const token = loginResponse.body.accessToken
      cy.log('Received token:', token)
      // 2. використати token
      cy.request({
        method: 'GET',
        url: 'https://dummyjson.com/auth/me',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((userResponse) => {

        // 3. перевірка доступу
        expect(userResponse.status).to.eq(200)
        expect(userResponse.body).to.have.property('username')
      })

    })

  })


it('Log in with an invalid token', () => {

  cy.request({
    method: 'GET',
    url: 'https://dummyjson.com/auth/me',
    failOnStatusCode: false,
    headers: {
      Authorization: 'Bearer invalid_token_123'
    }
  }).then((res) => {

    expect(res.status).to.eq(401)

  })

})



it('Log in with an empty token', () => {

  cy.request({
    method: 'GET',
    url: 'https://dummyjson.com/auth/me',
    failOnStatusCode: false,
    headers: {
      Authorization: 'Bearer '
    }
  }).then((res) => {

    expect(res.status).to.eq(401)

  })

})


})

