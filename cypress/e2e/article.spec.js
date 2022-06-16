const TITLE_INPUT = '[placeholder="Article Title"]';
const TOPIC_INPUT = '[placeholder="What\'s this article about?"]';
const BODY_INPUT = '[placeholder="Write your article (in markdown)"]';
const TAGS_INPUT = '[placeholder="Enter tags"]';
const PUBLISH_BTN = '[type=button]';
const ERR_MESSAGE = '.error-messages';

describe('Article', () => {
  before(() => {
    cy.loginDefaultUser();
    cy.getToken().as('token');
  });

  beforeEach(function () {
    cy.visit('/#/editor/');
    localStorage.setItem('jwtToken', this.token);
  });

  it('active header link is correct', () => {
    cy.get('.navbar .active').as('newArticle');
    cy.get('@newArticle').contains('New Article');
    cy.get('@newArticle').invoke('attr', 'href').should('be.equal', '#/editor/');
  });

  it('requires article title', () => {
    cy.get(PUBLISH_BTN).click();
    cy.get(ERR_MESSAGE).invoke('text').should('contain', "title can't be blank"); //contains("title can't be blank");
  });

  it('requires article description', () => {
    cy.get(TITLE_INPUT).type('Random article title');
    cy.get(PUBLISH_BTN).click();
    cy.get(ERR_MESSAGE).invoke('text').should('contain', "description can't be blank"); //contains("title can't be blank");
  });

  it('creates valid article', () => {
    cy.intercept('POST', 'https://api.realworld.io/api/articles').as('route');

    cy.get(TITLE_INPUT).type('Random article title' + Date.now());
    cy.get(TOPIC_INPUT).type('Random topi for an article');
    cy.get(BODY_INPUT).type('Here goes the article itself');
    cy.get(TAGS_INPUT).type('Random, MyArticle');
    cy.get(PUBLISH_BTN).click();
    cy.wait('@route').then((resp) => {
      expect(resp.response.body.article).to.be.an('object');
      cy.url().should('contain', resp.response.body.article.slug);
    });
  });
});
