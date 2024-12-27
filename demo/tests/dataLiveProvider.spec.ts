import { v4 as uuidv4 } from "uuid";
import PocketBase from "pocketbase";
import { expect, test } from "@playwright/test";

const PB_URL = "http://127.0.0.1:8090";
const EMAIL = `test-user@example.com`;
const PASSWORD = "1234567890";

const pb = new PocketBase(PB_URL);

const posts = [
  { id: "sd2ku2su5qgffac", title: "first entry" },
  { title: "second entry", id: "vza5i7h11j1fuxt" },
];

test.describe.configure({ mode: "serial" });

test.describe("data and live provider", () => {
  test.beforeEach(async ({ page }) => {
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

    await page.goto("/login");
    await page.fill("#login-email", EMAIL);
    await page.fill("#login-password", PASSWORD);
    await page.click('[type="submit"]');
    await page.waitForURL("**/posts");
  });

  test("list", async ({ page }) => {
    // sort asc
    await page.goto("/posts?&sorters[0][field]=title&sorters[0][order]=asc");
    await expect(page.locator("tbody > tr > :nth-child(4)")).toHaveText([
      "first entry",
      "second entry",
    ]);

    //sort desc
    await page.goto("/posts?&sorters[0][field]=title&sorters[0][order]=desc");
    await expect(page.locator("tbody > tr > :nth-child(4)")).toHaveText([
      "second entry",
      "first entry",
    ]);

    // filter
    await page.goto(
      "/posts?filters[0][field]=title&filters[0][operator]=contains&filters[0][value]=first"
    );
    await expect(page.locator("tbody > tr")).toHaveCount(1);
  });

  test("get", async ({ page }) => {
    await page.click(
      "tbody tr:nth-child(1) > td:nth-child(6) button:nth-child(1)"
    );
    await page.waitForURL("**/posts/show/**");
  });

  test("create & update", async ({ page }) => {
    const title = uuidv4();
    await expect(page.locator("tbody > tr")).toHaveCount(2);

    await page.click("h1 ~ button");
    await page.waitForURL("**/posts/create");

    await page.fill("input[name=collectionName]", "posts");
    await page.fill("input[name=title]", title);
    await page.fill("input[name=created]", new Date().toISOString());
    await page.fill("input[name=updated]", new Date().toISOString());
    await page.click("input[type=submit]");

    await page.waitForURL("**/posts");
    await expect(
      page.locator("tbody tr:last-child td:nth-child(4)")
    ).toHaveText(title);

    await page.click("tbody tr:last-child td:last-child button:last-child");
    await page.waitForURL("**/posts/edit/**");

    const updatedTitle = uuidv4();
    await page.fill("input[name=title]", updatedTitle);
    await page.click("input[type=submit]");
    await page.waitForURL("**/posts");
    await expect(
      page.locator("tbody tr:last-child td:nth-child(4)")
    ).toHaveText(updatedTitle);
  });

  test("pagination", async ({ page }) => {
    for (let i of [1, 2]) {
      await page.goto(
        `/posts?pageSize=1&current=${i}&sorters[0][field]=title&sorters[0][order]=asc`
      );
      await expect(
        page.locator("tbody > tr:first-child> :nth-child(4)")
      ).toHaveText(posts[i - 1].title);
    }
  });

  test("live updates", async ({ page }) => {
    await page.goto("/posts?&sorters[0][field]=title&sorters[0][order]=asc");
    await expect(page.locator("tbody > tr")).toHaveCount(2);
    await pb
      .collection("posts")
      .create({ title: "third entry" }, { requestKey: null });
    await expect(page.locator("tbody > tr")).toHaveCount(3);

    await expect(
      page.locator("tbody > tr:first-child > td:nth-child(4)")
    ).toHaveText(posts[0].title);

    await pb
      .collection("posts")
      .update(posts[0].id, { title: "updated title" });

    await expect(
      page.locator("tbody > tr:last-child > td:nth-child(4)")
    ).toHaveText("updated title");
  });

  test("custom hook", async ({ page }) => {
    await page.goto("/custom");
    await expect(page.locator("h1")).toHaveText("Custom Page");
    await expect(page.locator("span")).toHaveText("ID: 1");
    await expect(page.getByText("Title: Custom Page Data")).toHaveCount(1);
    await expect(
      page.getByText(
        "Description: This is some dummy content for the CustomPage in the demo application."
      )
    ).toHaveCount(1);
  });
});
