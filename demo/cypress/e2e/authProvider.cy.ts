/// <reference types="cypress" />
import { v4 as uuidv4 } from "uuid";

const URL = "http://localhost:5173";
const EMAIL = `${uuidv4()}@example.com`;
const PASSWORD = "1234567890";
const CHANGED_PASSWORD = "0987654321";
const INBUCKET_URL = "http://localhost:9000";

describe("auth provider", () => {
  it("register and login", () => {
    cy.visit(URL);
    cy.get("a[href='/register']").click();
    cy.get("#email-input").type(EMAIL);
    cy.get("#password-input").type(PASSWORD);
    cy.get('[type="submit"]').click();
    cy.url().should("include", "/login");
    cy.get("#email-input").type(EMAIL);
    cy.get("#password-input").type(PASSWORD);
    cy.get('[type="submit"]').click();
    cy.url().should("include", "/posts");
  });

  it("reset password", () => {
    cy.visit(URL);
    cy.get("a[href='/forgot-password']").click();
    cy.get("#email-input").type(EMAIL);
    cy.get('[type="submit"]').click();
    cy.url().should("include", "/update-password");

    cy.visit(`${INBUCKET_URL}/monitor`);
    cy.get("table.monitor tbody tr").first().click();
    cy.get("article.message-body rendered-html")
      .first()
      .then((el) => {
        cy.visit(`${URL}/update-password?token=${el.text().trim()}`);
        cy.get("#password-input").type(CHANGED_PASSWORD);
        cy.get("#confirm-password-input").type(CHANGED_PASSWORD);
        cy.get('[type="submit"]').click();
        cy.url().should("include", "/login");
        cy.get("#email-input").type(EMAIL);
        cy.get("#password-input").type(CHANGED_PASSWORD);
        cy.get('[type="submit"]').click();
        cy.url().should("include", "/posts");
      });
  });
});
