describe('Walk a ticket through its full status workflow', () => {
  it('advances Open -> In Progress -> Resolved -> Closed', () => {
    const title = `Broken monitor cable ${Date.now()}`
    const resolutionNote = 'Replaced the HDMI cable and confirmed the display works.'

    cy.loginAs('employee')
    cy.visit('/tickets/new')
    cy.get('#page-title').type(title)
    cy.get('#page-description').type('The monitor keeps losing signal, the video cable looks damaged.')
    cy.pickOption('#page-category', 'TI')
    cy.pickOption('#page-priority', 'Alta')
    cy.contains('button', 'Abrir chamado').click()

    cy.location('pathname').should('match', /^\/tickets\/\d+$/)
    cy.contains('Aberto').should('be.visible')
    cy.contains('button', 'Mover para').should('not.exist')

    cy.location('pathname').then((pathname) => {
      cy.loginAs('support')
      cy.visit(pathname)

      cy.contains('button', 'Mover para Em andamento').click()
      cy.contains('Em andamento').should('be.visible')

      cy.contains('button', 'Mover para Resolvido').click()
      cy.get('#resolve-modal-resolution-note').type(resolutionNote)
      cy.contains('button', 'Marcar como resolvido').click()
      cy.contains('Resolvido').should('be.visible')
      cy.contains(resolutionNote).should('be.visible')

      cy.contains('button', 'Mover para Fechado').click()
      cy.contains('Fechado').should('be.visible')
      cy.contains('button', 'Mover para').should('not.exist')

      cy.get('ol li').should('have.length', 4)
    })
  })
})
