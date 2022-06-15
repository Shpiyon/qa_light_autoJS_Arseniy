describe('Profile Settings Page', () => {
  before(() => {
    cy.loginDefaultUser();
    cy.getToken().as('token');
    cy.visit('/#/settings');
  });

  beforeEach(function () {
    localStorage.setItem('jwtToken', this.token);
  });

  it('has valid header', () => {
    cy.contains('h1', 'Your Settings');
  });

  it('active header link is correct', () => {
    cy.get('.navbar .active').as('settingsItem');
    cy.get('@settingsItem').contains('Settings');
    cy.get('@settingsItem').invoke('attr', 'href').should('be.equal', '#/settings');
  });

  it('logs out', () => {
    cy.contains('button', 'Or click here to logout.').click();
    cy.url().should('equal', Cypress.config('baseUrl') + '#/');
    cy.getToken().should('equal', null);
  });
});
