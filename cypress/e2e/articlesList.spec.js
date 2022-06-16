const TAGS_QUERY_URL = 'https://api.realworld.io/api/articles?limit=10&offset=0&tag=implementations';
const LIKE_BUTTON = 'body > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > '
  + 'div:nth-child(1) > article-list:nth-child(2) > article-preview:nth-child(1) > div:nth-child(1) > article-meta:nth-child(1) > '
  + 'div:nth-child(1) > ng-transclude:nth-child(3) > favorite-btn:nth-child(1) > button:nth-child(1)'

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

  it('Check Update Tag is presented', () => {
    cy.get('.tag-list').contains('update')
  })

  it.skip('check if article is displayed correctly', () => {
    cy.contains('.sidebar a', 'implementations').click();
    cy.get('@articleData').then((data) => {
      cy.contains('h1', data.title).closest('[article=article]').as('article');
      cy.get('@article').find('.tag-list').find('li').should('have.length', 3);
    });
  });
});

describe('Likes for the article', () => {
  beforeEach(() => {
    cy.loginDefaultUser();
    cy.createArticle().as('article')
    cy.get('@article').then((articlebody) => {
      cy.wrap(articlebody.slug).as('articleSlug')
      cy.visit('/');
    })
  })

  it('Add like to the article', () => {
    cy.intercept({ method: 'POST', hostname: "api.realworld.io", path: "**/articles/**" }).as('addLike')
    cy.get('[ng-click="$ctrl.changeList({ type: \'all\' })"]').click()
    cy.get(LIKE_BUTTON).first().click()
    cy.wait('@addLike')
    cy.get("@addLike").then(resp => {
      console.log(resp)
      expect(resp.response.body.article.favoritesCount).to.be.equal(1)
    })
  })

  it('Remove like from the article', () => {
    cy.intercept({ method: 'POST', hostname: "api.realworld.io", path: "**/articles/**" }).as('addLike')
    cy.intercept({ method: 'DELETE', hostname: "api.realworld.io", path: "**/articles/**" }).as('removeLike')
    cy.get('[ng-click="$ctrl.changeList({ type: \'all\' })"]').click()
    cy.get(LIKE_BUTTON).first().click()
    cy.wait('@addLike')
    cy.get(LIKE_BUTTON).first().click()
    cy.wait('@removeLike')
    cy.get("@removeLike").then(resp => {
      console.log(resp)
      expect(resp.response.body.article.favoritesCount).to.be.equal(0)
    })
  })

  afterEach(() => {
    cy.get('@articleSlug').then((articleSlug) => {
      cy.deleteArticle(articleSlug)
      cy.request({
        method: 'GET',
        url: 'https://api.realworld.io/api/articles/' + articleSlug,
        failOnStatusCode: false
      }).then(resp => {
        expect(resp.status).to.be.equal(404)
      })
    })
  })
})