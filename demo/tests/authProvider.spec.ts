import { type APIRequestContext, expect, type Page, test } from "@playwright/test";
import PocketBase from "pocketbase";
import { v4 as uuidv4 } from "uuid";

const INBUCKET_URL = "http://127.0.0.1:9000";
const EXISTING_EMAIL = "test-user@example.com";

const PB_URL = "http://127.0.0.1:8090";
const EMAIL = `test@example.com`;
const PASSWORD = "1234567890";

const pb = new PocketBase(PB_URL);

pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);

// some tests depend on global configurations that may conflict with other tests when run in parallel 
test.describe.configure({ mode: 'serial' });

test.describe("auth provider", () => {
  test("register happy path", async ({ page })=> {
    await register(page);
  });

  test("register with validation happy path", async ()=>{});
  
  test("register error", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/register"]');
    await page.fill("#register-email", EXISTING_EMAIL);
    await page.fill("#register-password", "1234567890");
    await page.click("#register-submit");

    await assertNotification(page, "Registration failed");
  });

  test("login with mfa happy path", async ({ page, request }) => {
    // activate mfa 
    await pb.collections.update("users", {
      passwordAuth: { enabled: true },
      otp: { enabled: true },
      mfa: { enabled: true },
    });
  
    const { mailbox, email, password } = await register(page);
    
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

    await assertNotification(page, "Login successful");
  
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
  
    await assertNotification(page, "Login successful");

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
  
    const { email, password } = await register(page);
    
    // login
    await page.waitForURL("**/login**");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password); 
    await page.click("#login-submit");

    await page.waitForURL("**/posts");

    await assertNotification(page, "Login successful");
  
    //  logout
    await page.click("#auth-logout");
    await page.waitForURL("**/login*");
  });

  test("login with error", async ({ page }) => {
    await page.goto("/");
    await page.fill("#login-email", `${uuidv4()}@${uuidv4()}.com`);
    await page.fill("#login-password", "12345"); 
    // submit empty credentials
    await page.click("#login-submit");
    await assertNotification(page, "Invalid credentials");
  });

  test("password reset contains errors", async ({ page }) => {
    await page.goto("/");
    await page.click("a[href='/forgot-password']");

    await page.click('[type="submit"]');
    expect(await page.textContent("#notification-message")).toContain(
      "Forgot Password Error"
    );
  });

  test("password reset happy path", async ({ page, request }) => {
    const { mailbox, email } = await register(page);

    const changedPassword = "0987654321";

    // reset pw
    await page.waitForURL("**/login**");
    await page.click("a[href='/forgot-password']");
    await page.fill("#email-input", email);
    await page.click('[type="submit"]');
    assertNotification(page, "Password reset link sent");

    // wait for email delivery
    await page.waitForTimeout(2000);

    const token = await fetchLatestEmail(request, mailbox); // read token from email

    // update password
    await page.goto(`/update-password?token=${token}`);
    await page.fill("#password-input", changedPassword);
    await page.fill("#confirm-password-input", changedPassword);
    await page.click('[type="submit"]');
    assertNotification(page, "Password updated");
    await page.waitForURL("**/login**");

    // login to confirm new pw
    await page.fill("#login-email", email);
    await page.fill("#login-password", changedPassword);
    await page.click('[type="submit"]');
    await page.waitForURL("**/posts");
  });

  test("update password with error", async ({ page }) => {
    await page.goto("/update-password?token=invalid_token");
    await page.fill("#password-input", "123");
    await page.fill("#confirm-password-input", "321");
    await page.click('[type="submit"]');
    await assertNotification(page, "Password update failed");
  });
});

const register = async (page: Page) => {
  const mailbox = uuidv4();
  const [email, password] = [`${mailbox}@example.com`, "1234567890"];
  
  await page.goto("/");
  await page.click('a[href="/register"]');
  await page.fill("#register-email", email);
  await page.fill("#register-password", password);
  await page.click("#register-submit");

  await assertNotification(page, "Registration completed");

  return { mailbox, email, password };
}

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

const assertNotification = async (page: Page, text: string) => {
  await expect(page.locator("#notification-message"))
    .toHaveText(text);
}
