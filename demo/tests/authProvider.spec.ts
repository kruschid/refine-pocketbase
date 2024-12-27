import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

const INBUCKET_URL = "http://127.0.0.1:9000";
const EXISTING_EMAIL = "test-user@example.com";

test.describe("auth provider", () => {
  test("register and login happy path", async ({ page }) => {
    const [email, password] = [`${uuidv4()}@example.com`, "1234567890"];

    await page.goto("/");
    await page.click('a[href="/register"]');
    await page.fill("#register-email", email);
    await page.fill("#register-password", password);
    await page.click("#register-submit");
    await page.waitForURL("**/login**");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await page.click("#login-submit");
    await page.waitForURL("**/posts");
  });

  test("register response contains errors", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/register"]');
    await page.fill("#register-email", EXISTING_EMAIL);
    await page.fill("#register-password", "123");
    await page.click("#register-submit");

    expect(await page.textContent("#register-error")).toContain(
      "Failed to create record."
    );
    expect(await page.textContent("#register-email-error")).toContain(
      "Value must be unique."
    );

    await page.fill("#register-email", `${uuidv4()}@example.com`);
    await page.fill("#register-password", "123");
    await page.click("#register-submit");

    expect(await page.textContent("#register-password-error")).toContain(
      "Must be at least 8 character(s)."
    );
  });

  test("password reset contains errors", async ({ page }) => {
    await page.goto("/");
    await page.click("a[href='/forgot-password']");

    await page.fill("#email-input", "not_a_valid_email");
    await page.click('[type="submit"]');
    expect(await page.textContent("#forgot-password-error")).toContain(
      "Must be a valid email address."
    );
  });

  test("password reset happy path", async ({ page, request }) => {
    const mailbox = uuidv4();
    const [email, password, changedPassword] = [
      `${mailbox}@test.com`,
      "1234567890",
      "0987654321",
    ];

    // register
    await page.goto("/register");
    await page.fill("#register-email", email);
    await page.fill("#register-password", password);
    await page.click("#register-submit");

    // rest pw
    await page.waitForURL("**/login**");
    await page.click("a[href='/forgot-password']");
    await page.fill("#email-input", email);
    await page.click('[type="submit"]');
    expect(await page.textContent("#forgot-password-success")).toContain(
      "Please check your mailbox for the token"
    );

    // wait for email delivery
    await page.waitForTimeout(2000);

    const token = await // read token from email
    request
      .get(`${INBUCKET_URL}/api/v1/mailbox/${mailbox}`)
      .then((res) => res.json())
      .then(([{ id }]) =>
        request.get(`${INBUCKET_URL}/api/v1/mailbox/${mailbox}/${id}`)
      )
      .then((res) => res.json())
      .then((res) => res.body.text);

    // update password
    await page.goto(`/update-password?token=${token}`);
    await page.fill("#password-input", changedPassword);
    await page.fill("#confirm-password-input", changedPassword);
    await page.click('[type="submit"]');
    await page.waitForURL("**/login**");

    // login to confirm new pw
    await page.fill("#login-email", email);
    await page.fill("#login-password", changedPassword);
    await page.click('[type="submit"]');
    await page.waitForURL("**/posts");
  });

  test("update password errors", async ({ page }) => {
    await page.goto("/update-password?token=invalid_token");
    await page.fill("#password-input", "123");
    await page.fill("#confirm-password-input", "321");
    await page.click('[type="submit"]');
    expect(await page.textContent("#token-error")).toContain(
      "Invalid or expired token."
    );
    expect(await page.textContent("#password-input-error")).toContain(
      "The length must be between 8 and 255."
    );
    expect(await page.textContent("#confirm-password-input-error")).toContain(
      "Values don't match."
    );
  });
});
