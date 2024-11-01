/// <reference types="cypress" />
import { v4 as uuidv4 } from "uuid";

const DEMO_URL = Cypress.env("DEMO_URL") ?? "http://127.0.0.1:5173";
const MAILBOX = uuidv4();
const EMAIL = `${MAILBOX}@example.com`;
const PASSWORD = "1234567890";
const CHANGED_PASSWORD = "0987654321";
const INBUCKET_URL = Cypress.env("INBUCKET_URL") ?? "http://127.0.0.1:9000";

describe("auth provider", () => {
  it("register, login and reset password", async () => {
    cy.clearLocalStorage();
    cy.visit(DEMO_URL);
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
    cy.visit(DEMO_URL);
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
    cy.visit(DEMO_URL);
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
    cy.request(`${INBUCKET_URL}/api/v1/mailbox/${MAILBOX}`)
      .then((res) =>
        cy.request(
          `${INBUCKET_URL}/api/v1/mailbox/${MAILBOX}/${res.body[0].id}`
        )
      )
      .then((res) => {
        cy.visit(`${DEMO_URL}/update-password?token=${res.body.body.text}`);
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
    cy.visit(`${DEMO_URL}/update-password?token=invalid_token`);
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
