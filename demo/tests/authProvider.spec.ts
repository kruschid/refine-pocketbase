import { type APIRequestContext, expect, test } from "@playwright/test";
import PocketBase from "pocketbase";
import { v4 as uuidv4 } from "uuid";

const INBUCKET_URL = "http://127.0.0.1:9000";
const EXISTING_EMAIL = "test-user@example.com";

const PB_URL = "http://127.0.0.1:8090";
const EMAIL = `test@example.com`;
const PASSWORD = "1234567890";

const pb = new PocketBase(PB_URL);

pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);

test.describe("auth provider", () => {
  test("login with mfa happy path", async ({ page, request }) => {
    // activate mfa 
    await pb.collections.update("users", {
      passwordAuth: { enabled: true },
      otp: { enabled: true },
      mfa: { enabled: true },
    });
  
    const mailbox = uuidv4();
    const [email, password] = [`${mailbox}@example.com`, "1234567890"];

    await page.goto("/");

    //register 
    await page.click('a[href="/register"]');
    await page.fill("#register-email", email);
    await page.fill("#register-password", password);
    await page.click("#register-submit");
    
    // login
    await page.waitForURL("**/login**");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password); 
    await page.click("#login-submit");

    // fetch otp from inbucket
    await page.waitForTimeout(2000); // wait for email delivery
    const token = await fetchLatestEmail(request, mailbox);
    // fill out otp 
    await page.fill("#login-otp", token);
    await page.click("#login-submit");
    await page.waitForURL("**/posts");
  
    //  logout
    await page.click("#auth-logout");
    await page.waitForURL("**/login**");
  });

  test("login with otp happy path", async ({ page, request }) => {
    // activate otp 
    await pb.collections.update("users", {
      passwordAuth: { enabled: false },
      otp: { enabled: true },
      mfa: { enabled: false },
    });
    
    const email = EXISTING_EMAIL; // only registered users are supported for now
    const mailbox = email.split("@")[0];

    await page.goto("/");
    
    // login
    await page.waitForURL("**/login**");
    await page.fill("#login-email", email);
    await page.click("#login-submit");

    // fetch otp from inbucket
    await page.waitForTimeout(2000); // wait for email delivery
    const token = await fetchLatestEmail(request, mailbox);
    // fill out otp 
    await page.fill("#login-otp", token);
    await page.click("#login-submit");
    await page.waitForURL("**/posts");
  
    //  logout
    await page.click("#auth-logout");
    await page.waitForURL("**/login*");
  });

  test("login with password happy path", async ({ page }) => {
    await pb.collections.update("users", {
      passwordAuth: { enabled: true },
      otp: { enabled: false },
      mfa: { enabled: false },
    });
  
    const mailbox = uuidv4();
    const [email, password] = [`${mailbox}@example.com`, "1234567890"];

    await page.goto("/");

    //register 
    await page.click('a[href="/register"]');
    await page.fill("#register-email", email);
    await page.fill("#register-password", password);
    await page.click("#register-submit");
    
    // login
    await page.waitForURL("**/login**");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password); 
    await page.click("#login-submit");

    await page.click("#login-submit");
    await page.waitForURL("**/posts");
  
    //  logout
    await page.click("#auth-logout");
    await page.waitForURL("**/login*");
  });

  test("register response contains errors", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/register"]');
    await page.fill("#register-email", EXISTING_EMAIL);
    await page.fill("#register-password", "1234567890");
    await page.click("#register-submit");

    expect(await page.textContent("#register-error")).toContain(
      "Failed to create record."
    );
    expect(await page.textContent("#register-email-error")).toContain(
      "Value must be unique."
    );

    await page.reload();
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

    const token = await fetchLatestEmail(request, mailbox); // read token from email

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

const fetchLatestEmail = async (
  request: APIRequestContext,
  mailbox: string,
): Promise<string> =>
  request
    .get(`${INBUCKET_URL}/api/v1/mailbox/${mailbox}`)
    .then((res) => res.json())
    .then((emails) =>
      request.get(`${INBUCKET_URL}/api/v1/mailbox/${mailbox}/${emails.at(-1).id}`)
    )
    .then((res) => res.json())
    .then((res) => res.body.text);
