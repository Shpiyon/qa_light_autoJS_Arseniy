import { EMAIL, PASSWORD } from '../creds';

const EMAIL_INPUT = '[type=email]';
const PWD_INPUT = '[type=password]';
const SUBMIT_BTN = '[type=submit]';
const ERR_MESSAGE = '.error-messages';

const INVALID_PWD_OR_EMAIL_MESSAGE = 'email or password is invalid';

describe('Login Page', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/#/login');
  });

  after(() => {
    cy.logout();
  });

  it('has Sign in header', () => {
    cy.contains('h1', 'Sign in');
  });

  it('correct link', () => {
    cy.contains('a', 'Need an account?').should('have.attr', 'href', '#/register');
  });

  it('requires email', () => {
    cy.get(PWD_INPUT).type(PASSWORD);
    cy.get(SUBMIT_BTN).click();
    cy.get(ERR_MESSAGE).should('contain', "email can't be blank");
  });

  it('requires password', () => {
    cy.get(EMAIL_INPUT).type(EMAIL);
    cy.get(SUBMIT_BTN).click();
    cy.get(ERR_MESSAGE).should('contain', "password can't be blank");
  });

  it('does not log in non existing user', () => {
    cy.get(EMAIL_INPUT).type('somenonexistinguser@gmail.com');
    cy.get(PWD_INPUT).type(PASSWORD);
    cy.get(SUBMIT_BTN).click();
    cy.get(ERR_MESSAGE).should('contain', INVALID_PWD_OR_EMAIL_MESSAGE);
  });

  it('does not log in with incorrect password', () => {
    cy.get(EMAIL_INPUT).type(EMAIL);
    cy.get(PWD_INPUT).type('invalidPassword');
    cy.get(SUBMIT_BTN).click();
    cy.get(ERR_MESSAGE).should('contain', INVALID_PWD_OR_EMAIL_MESSAGE);
  });

  it('login by mouse click', () => {
    cy.get(EMAIL_INPUT).type(EMAIL);
    cy.get(PWD_INPUT).type(PASSWORD);
    cy.get(SUBMIT_BTN).click();

    cy.url().should('be.equal', Cypress.config('baseUrl') + '#/');
  });

  it('login by press enter', () => {
    cy.get(EMAIL_INPUT).type(EMAIL);
    cy.get(PWD_INPUT).type(`${PASSWORD}{enter}`);
    cy.url().should('be.equal', Cypress.config('baseUrl') + '#/');
  });
});
