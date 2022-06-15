const TAGS_QUERY_URL = 'https://api.realworld.io/api/articles?limit=10&offset=0&tag=implementations';

describe('Articles List Retrieved By Tag', () => {
  before(() => {
    cy.loginDefaultUser();
    cy.visit('/');
    cy.intercept('GET', TAGS_QUERY_URL).as('getArticlesByTag');
  });

  it('tag button retrieves correct data', () => {
    cy.contains('.sidebar a', 'implementations').click();
    cy.wait('@getArticlesByTag').then((data) => {
      const { articles } = data.response.body;
      articles.forEach((article) => {
        expect('implementations').to.be.oneOf(article.tagList);
      });
    });
  });
});

describe('Articles List is Dispalayed Correctly', () => {
  before(() => {
    cy.loginDefaultUser();
    cy.intercept('GET', TAGS_QUERY_URL, {
      fixture: 'articles.json',
    }).as('getArticlesByTag');
    cy.visit('/');
  });

  it('gets articles ', () => {
    cy.contains('.sidebar a', 'implementations').click();
    cy.get('[article=article]').should('have.length', 3);
  });
});

describe('Articles List is Dispalayed Correctly', () => {
  before(() => {
    cy.loginDefaultUser();
    cy.createArticle().as('articleData');
    cy.visit('/');
  });

  after(() => {
    cy.get('@articleData').then((data) => {
      console.log(data, '####');
    });
  });

  it('check if article is displayed correctly', () => {
    cy.contains('.sidebar a', 'implementations').click();
    cy.get('@articleData').then((data) => {
      cy.contains('h1', data.title).closest('[article=article]').as('article');
      cy.get('@article').find('.tag-list').find('li').should('have.length', 3);
    });
  });
});
