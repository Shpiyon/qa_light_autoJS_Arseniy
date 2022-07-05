const FOLLOW_BTN = "follow-btn[user='$ctrl.profile'] button:nth-child(1)"

describe('Follow Users', () => {
    before(() => {
        cy.loginDefaultUser();
        cy.getToken().as('token');
    })

    beforeEach(function () {
        cy.visit('#/@Gerome');
        localStorage.setItem('jwtToken', this.token);
    })

    it('Start Following User', () => {
        cy.intercept({ method: "POST", hostname: "api.realworld.io", path: "**/profiles/**" }).as('followUser')
        cy.get(FOLLOW_BTN).click()
        cy.wait('@followUser')
        cy.get('@followUser').then(resp => {
            expect(resp.response.statusCode).to.be.equal(200)
        cy.visit('/')
        cy.get('[ng-bind="$ctrl.article.author.username"]').first().contains('Gerome')
        })
        cy.visit('#/@Gerome');
    })

    it('Stop Following User', () => {
        cy.intercept({ method: "DELETE", hostname: "api.realworld.io", path: "**/profiles/**" }).as('stopFollowUser')
        cy.get(FOLLOW_BTN).click()
        cy.wait('@stopFollowUser')
        cy.get('@stopFollowUser').then(resp => {
            console.log(resp.response)
            expect(resp.response.statusCode).to.be.equal(200)
        })
    })
})
