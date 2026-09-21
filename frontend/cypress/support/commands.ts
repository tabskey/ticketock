export type Role = 'employee' | 'support'

const CREDENTIALS: Record<Role, { email: string; password: string }> = {
  employee: { email: 'employee@company.com', password: 'employee123' },
  support: { email: 'support@company.com', password: 'support123' },
}

Cypress.Commands.add('loginAs', (role: Role) => {
  const { email, password } = CREDENTIALS[role]

  cy.clearCookies()
  cy.clearLocalStorage()
  cy.window().then((win) => win.sessionStorage.clear())
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.contains('button', 'Entrar').click()
  cy.location('pathname').should('not.eq', '/login')
})

Cypress.Commands.add('pickOption', (triggerSelector: string, optionLabel: string) => {
  cy.get(triggerSelector).click()
  cy.get('ul[role="listbox"]').contains('li[role="option"]', optionLabel).click()
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: Role): Chainable<void>
      pickOption(triggerSelector: string, optionLabel: string): Chainable<void>
    }
  }
}
