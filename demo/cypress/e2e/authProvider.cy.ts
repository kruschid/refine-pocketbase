/// <reference types="cypress" />
import { v4 as uuidv4 } from "uuid";

const URL = "http://localhost:5173";
const EMAIL = `${uuidv4()}@example.com`;
const PASSWORD = "1234567890";
const CHANGED_PASSWORD = "0987654321";
const INBUCKET_URL = "http://localhost:9000";

describe("auth provider", () => {
  it("register, login and reset password", () => {
    cy.clearLocalStorage();
    cy.visit(URL);
    cy.get("a[href='/register']").click();
    cy.get("#register-email").type(EMAIL);
    cy.get("#register-password").type(PASSWORD);
    cy.get("#register-submit").click();
    cy.url().should("include", "/login");
    cy.get("#login-email").type(EMAIL);
    cy.get("#login-password").type(PASSWORD);
    cy.get("#login-submit").click();
    cy.url().should("include", "/posts");

    // register response contains errors
    cy.clearLocalStorage();
    cy.visit(URL);
    cy.get("a[href='/register']").click();
    cy.get("#register-email").type(EMAIL);
    cy.get("#register-password").type("123");
    cy.get("#register-submit").click();

    cy.get("#register-error").should(
      "contain.text",
      "Failed to create record."
    );
    cy.get("#register-email-error").should(
      "contain.text",
      "The email is invalid or already in use."
    );
    cy.get("#register-password-error").should(
      "contain.text",
      "The length must be between 8 and 72."
    );

    // password reset
    cy.visit(URL);
    cy.get("a[href='/forgot-password']").click();

    // error
    cy.get("#email-input").type("not_a_valid_email");
    cy.get('[type="submit"]').click();
    cy.get("#forgot-password-error").should(
      "contain",
      "Must be a valid email address."
    );

    // happy path
    cy.get("#email-input").clear().type(EMAIL);
    cy.get('[type="submit"]').click();
    cy.get("#forgot-password-success").should(
      "contain",
      "Please check your mailbox for the token"
    );

    // update password happy path
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
        cy.get("#login-email").type(EMAIL);
        cy.get("#login-password").type(CHANGED_PASSWORD);
        cy.get('[type="submit"]').click();
        cy.url().should("include", "/posts");
      });

    // update password errors
    cy.visit(`${URL}/update-password?token=invalid_token`);
    cy.get("#password-input").type("123");
    cy.get("#confirm-password-input").type("321");
    cy.get('[type="submit"]').click();
    cy.get("#token-error").should("contain", "Invalid or expired token.");
    cy.get("#password-input-error").should(
      "contain",
      "The length must be between 8 and 100."
    );
    cy.get("#confirm-password-input-error").should(
      "contain",
      "Values don't match."
    );
  });
});
