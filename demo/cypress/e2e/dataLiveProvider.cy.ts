/// <reference types="cypress" />
import { v4 as uuidv4 } from "uuid";
import PocketBase from "pocketbase";

const URL = "http://localhost:5173";
const EMAIL = `test@example.com`;
const PASSWORD = "1234567890";

const login = () => {
  cy.visit(URL);
  cy.url().should("include", "/login");
  cy.get("#email-input").type(EMAIL);
  cy.get("#password-input").type(PASSWORD);
  cy.get('[type="submit"]').click();
  cy.url().should("include", "/posts");
};

const pb = new PocketBase("http://localhost:8090");

const posts = [
  { id: "sd2ku2su5qgffac", title: "first entry" },
  { title: "second entry", id: "vza5i7h11j1fuxt" },
];

beforeEach(async () => {
  await pb
    .collection("posts")
    .getFullList()
    .then((posts) =>
      Promise.all(posts.map((post) => pb.collection("posts").delete(post.id)))
    );
  await Promise.all(
    posts.map((post) => {
      pb.collection("posts").create(post, { requestKey: null });
    })
  );
});

describe("data and live provider", () => {
  it("list", () => {
    login();

    // sort asc
    cy.visit(`${URL}/posts?&sorters[0][field]=title&sorters[0][order]=asc`);
    cy.get("tbody > tr > :nth-child(4)").each((el, i) => {
      const orderedTitles = ["first entry", "second entry"];
      expect(el.text()).to.equal(orderedTitles[i]);
    });
    //sort desc
    cy.visit(`${URL}/posts?&sorters[0][field]=title&sorters[0][order]=desc`);
    cy.get("tbody > tr > :nth-child(4)").each((el, i) => {
      const orderedTitles = ["second entry", "first entry"];
      expect(el.text()).to.equal(orderedTitles[i]);
    });

    // filter
    cy.visit(
      `${URL}/posts?filters[0][field]=title&filters[0][operator]=contains&filters[0][value]=first`
    );
    cy.get("tbody > tr").should("have.length", 1);
  });

  it("get", () => {
    login();

    cy.get(
      "tbody tr:nth-child(1) > td:nth-child(6) button:nth-child(1)"
    ).click();

    cy.url().should("include", "/posts/show");
  });

  it("create & update", () => {
    login();

    const title = uuidv4();

    cy.get("tbody > tr").should("have.length.at.least", 1);

    cy.get("h1 ~ button").click();
    cy.url().should("include", "/posts/create");

    cy.get("input[name=collectionName]").type("posts");
    cy.get("input[name=title]").type(title);
    cy.get("input[name=created]").type(new Date().toISOString());
    cy.get("input[name=updated]").type(new Date().toISOString());
    cy.get("input[type=submit]").click();

    cy.url().should("include", "/posts");
    cy.get("tbody tr:last-child").within((el) => {
      cy.get("td:nth-child(4)").should("include.text", title);
      cy.get("td:last-child button:last-child").click();
    });

    cy.url().should("include", "/posts/edit");

    const updatedTitle = uuidv4();
    cy.get("input[name=title]").clear().type(updatedTitle);
    cy.get("input[type=submit]").click();

    cy.url().should("include", "/posts");
    cy.get("tbody tr:last-child td").should("contain.text", updatedTitle);
  });

  it("pagination", () => {
    login();
    cy.visit(`${URL}/posts?pageSize=1&current=1`);

    cy.get("tbody > tr:first-child> :nth-child(4)").should(
      "contain.text",
      "first entry"
    );

    cy.visit(`${URL}/posts?pageSize=1&current=2`);
    cy.get("tbody > tr:first-child> :nth-child(4)").should(
      "contain.text",
      "second entry"
    );
  });

  it("live updates", () => {
    login();

    cy.visit(`${URL}/posts?&sorters[0][field]=title&sorters[0][order]=asc`);

    cy.get("tbody > tr")
      .should("have.length", 2)
      .then(() => {
        pb.collection("posts").create(
          { title: "third entry" },
          { requestKey: null }
        );
      });

    cy.get("tbody > tr").should("have.length", 3);

    cy.get("tbody > tr:first-child > td:nth-child(4)").then((el) => {
      expect(el.text()).to.equal(posts[0].title);
      pb.collection("posts").update(posts[0].id, { title: "updated title" });
    });

    cy.get("tbody > tr:last-child > td:nth-child(4)").should(
      "contain.text",
      "updated title"
    );
  });
});
