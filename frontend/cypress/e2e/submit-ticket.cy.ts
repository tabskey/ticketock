describe('Submit a ticket', () => {
  it('lets an employee open a new ticket and see it on the list', () => {
    const title = `Printer jam on 3rd floor ${Date.now()}`
    const description = 'The printer on the 3rd floor keeps jamming every time a print job larger than one page is sent.'

    cy.loginAs('employee')
    cy.visit('/tickets/new')

    cy.get('#page-title').type(title)
    cy.get('#page-description').type(description)
    cy.pickOption('#page-category', 'Instalações')
    cy.pickOption('#page-priority', 'Baixa')
    cy.contains('button', 'Abrir chamado').click()

    cy.location('pathname').should('match', /^\/tickets\/\d+$/)
    cy.contains('h1', title).should('be.visible')
    cy.contains(description).should('be.visible')
    cy.contains('Aberto').should('be.visible')

    cy.visit('/tickets')
    cy.contains('a[href^="/tickets/"]:not([href="/tickets/new"])', title).should('be.visible')
  })
})
