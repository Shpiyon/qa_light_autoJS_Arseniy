const DESCRIPTION_INPUT = "input[ng-model='$ctrl.article.description']";
const BODY_INPUT = '[ng-model="$ctrl.article.body"]';
const TAGS_INPUT = "[ng-model='$ctrl.tagField']";
const PUBLISH_BTN = '[type=button]';
const COMMENT_INPUT = '[ng-submit="$ctrl.addComment()"]';
const ADD_COMMENT_BTN = "button[type='submit']";
const COMMENT_CARD = "div[class='card']";

describe('Editing Article', () => {

  beforeEach(function () {
    cy.loginDefaultUser();
    cy.getToken().as('token');
    localStorage.setItem('jwtToken', this.token);

    cy.createArticle().as('article')
    cy.get('@article').then((articlebody) => {
      cy.wrap(articlebody.slug).as('articleSlug')
      cy.wrap(articlebody.title).as('articleTitle')
      cy.get('@articleSlug')
        .then((articleSlug) => {
          cy.visit('#/article/' + articleSlug)
        })
    })
  })

  it('Edit article', () => {
    cy.get('@articleTitle')
      .then((articleTitle) => {
        cy.get("h1[class='ng-binding']").should('have.text', articleTitle)
        cy.get('[ui-sref="app.editor({ slug: $ctrl.article.slug })"]').first().click()
        cy.get(DESCRIPTION_INPUT).type('update')
        cy.get(BODY_INPUT).type('update')
        cy.get(TAGS_INPUT).type('update{enter}')
        cy.get(PUBLISH_BTN).click()

        cy.get("div[class='ng-binding'] p").contains('update')
        cy.get("div[class='ng-binding']").contains('update')
        cy.get('.tag-list').children().contains('update')
      })
  })

  it('Add empty comment', () => {
    cy.intercept({ method: "POST", hostname: "api.realworld.io", path: "**/articles/**" }).as('addEmptyComment')
    cy.get(ADD_COMMENT_BTN).click()
    cy.wait('@addEmptyComment')
    cy.get("@addEmptyComment").then(resp => {
      console.log(resp.response)
      expect(resp.response.statusCode).to.be.equal(422)
      expect(resp.response.body).to.have.property('errors')
    })
  })

  it('Add comment to the article', () => {
    cy.get(COMMENT_INPUT).type("Comment")
    cy.get(ADD_COMMENT_BTN).click()
    cy.get(COMMENT_CARD).find('.card-text.ng-binding').should('have.text', 'Comment')
    cy.get('[ng-bind="::$ctrl.data.author.username"]').should('have.text', 'autocoach')
    let today = new Date()
    let date = today.toLocaleString('default', { month: 'long', day: "2-digit", year: 'numeric' })
    cy.get('.date-posted.ng-binding').should('have.text', date)
  })

  it('Add comment to the article via stub', () => {
    cy.reload()
    cy.get('@articleSlug').then((articleSlug) => {
      cy.intercept("GET", "**/articles/" + articleSlug + '/comments', { fixture: 'commentResponse.json' })
    })
    cy.get(COMMENT_CARD).find('.card-text.ng-binding').should('have.text', 'autotext')
    cy.get('[ng-bind="::$ctrl.data.author.username"]').should('have.text', 'testuser')
    cy.get('.date-posted.ng-binding').should('have.text', 'June 16, 2022')

  })


  it('Delete comment from article', () => {
    cy.intercept({ method: "DELETE", hostname: "api.realworld.io", path: "**/articles/**" }).as('deleteComment')
    cy.get(COMMENT_INPUT).type("Comment")
    cy.get(ADD_COMMENT_BTN).click()
    cy.get(COMMENT_CARD).find('.card-text.ng-binding').should('have.text', 'Comment')
    cy.get("i[ng-click='$ctrl.deleteCb()']").click()

    cy.wait('@deleteComment')
    cy.get('@deleteComment').then((resp) => {
      expect(resp.response.statusCode).to.be.equal(200)
    })
    cy.get(COMMENT_CARD).should('not.exist')

  })

  it('Delete article', () => {
    cy.intercept({ method: "DELETE", hostname: "api.realworld.io", path: "**/articles/**" }).as('deleteArticle')
    cy.get('[ng-click="$ctrl.deleteArticle()"]').first().click()
    cy.wait('@deleteArticle')
    cy.get('@deleteArticle').then(res => {
      expect(res.response.statusCode).to.be.equal(200)
    })
  })

  afterEach(() => {
    switch (Cypress.currentTest.title) {
      case 'Delete article': break;
      case 'Add comment to the article via stub': break;
      default:
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
    }
  })
})