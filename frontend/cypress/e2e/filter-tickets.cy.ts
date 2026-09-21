describe('Filter the ticket list', () => {
  const title = `Filter probe ticket ${Date.now()}`

  before(() => {
    cy.loginAs('employee')
    cy.visit('/tickets/new')
    cy.get('#page-title').type(title)
    cy.get('#page-description').type('Ticket created solely to exercise the list filters end to end.')
    cy.pickOption('#page-category', 'Instalações')
    cy.pickOption('#page-priority', 'Média')
    cy.contains('button', 'Abrir chamado').click()
    cy.location('pathname').should('match', /^\/tickets\/\d+$/)
  })

  beforeEach(() => {
    cy.loginAs('support')
    cy.visit('/tickets')
  })

  it('narrows results by category', () => {
    cy.pickOption('button[aria-label="Filtrar por categoria"]', 'Instalações')

    cy.contains('a[href^="/tickets/"]:not([href="/tickets/new"])', title).should('be.visible')
    cy.get('a[href^="/tickets/"]:not([href="/tickets/new"])').each((row) => {
      cy.wrap(row).find('span').eq(0).should('have.text', 'Instalações')
    })
  })

  it('narrows results by status', () => {
    cy.pickOption('button[aria-label="Filtrar por status"]', 'Aberto')

    cy.contains('a[href^="/tickets/"]:not([href="/tickets/new"])', title).should('be.visible')
    cy.get('a[href^="/tickets/"]:not([href="/tickets/new"])').each((row) => {
      cy.wrap(row).find('span').eq(2).should('have.text', 'Aberto')
    })
  })

  it('combines category and status filters', () => {
    cy.pickOption('button[aria-label="Filtrar por categoria"]', 'Instalações')
    cy.pickOption('button[aria-label="Filtrar por status"]', 'Aberto')

    cy.contains('a[href^="/tickets/"]:not([href="/tickets/new"])', title).should('be.visible')
    cy.get('a[href^="/tickets/"]:not([href="/tickets/new"])').each((row) => {
      cy.wrap(row).find('span').eq(0).should('have.text', 'Instalações')
      cy.wrap(row).find('span').eq(2).should('have.text', 'Aberto')
    })
  })
})
