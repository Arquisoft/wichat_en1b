const puppeteer = require("puppeteer");
const { defineFeature, loadFeature } = require("jest-cucumber");
const setDefaultOptions = require("expect-puppeteer").setDefaultOptions;
const feature = loadFeature("./features/login-form.feature");

let page;
let browser;

const expectAlertToBe = async (text) => {
  await page.waitForSelector('div[role="alert"]');
  const alertMessage = await page.$eval('div[role="alert"]', 
    (x) => x.textContent);
  expect(alertMessage).toContain(text);
};

defineFeature(feature, (test) => {
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })
      : await puppeteer.launch({ headless: false, slowMo: 30 });

    page = await browser.newPage();
    setDefaultOptions({ timeout: 10000 });

    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
    });

    // Go to Register page to create user
    await page.waitForSelector('button[data-testid="register-nav"]');
    await page.click('button[data-testid="register-nav"]');

    // Register a new user for login
    const usernameInput = await page.$('[data-testid="reg-username"] input');
    const passwordInput = await page.$('[data-testid="reg-password"] input');
    await usernameInput.type("testlogin");
    await passwordInput.type("StrongPass123!");
    await expect(page).toClick('button[type="submit"]');

    await expectAlertToBe("User added successfully");

    // Should automatically redirect to login after registration
    await page.waitForSelector('[data-testid="log-username"] input');
  });

  afterAll(async () => {
    await browser.close();
  });

  afterEach(async () => {
    await page.waitForSelector('button[data-testid="home-nav"]');
    await page.click('button[data-testid="home-nav"]');

    await page.waitForSelector('button[data-testid="login-nav"]');
    await page.click('button[data-testid="login-nav"]');
  });

  test("Login with valid credentials", ({ given, when, then }) => {
    let username;
    let password;

    given("Registered user with valid credentials", async () => {
      username = "testlogin";
      password = "StrongPass123!";
    });

    when("Logging in using the correct credentials", async () => {
      const usernameInput = await page.$('[data-testid="log-username"] input');
      const passwordInput = await page.$('[data-testid="log-password"] input');
      await usernameInput.type(username);
      await passwordInput.type(password);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show a success message", async () => {
      await expectAlertToBe("Login successful");

      // Logout
      await page.waitForSelector('button[data-testid="logout-nav"]');
      await page.click('button[data-testid="logout-nav"]');
    });
  });

  test("Login with empty username", ({ given, when, then }) => {
    let password;

    given("User without username", async () => {
      password = "StrongPass123!";
    });

    when("Trying to log in", async () => {
      const passwordInput = await page.$('[data-testid="log-password"] input');
      await passwordInput.type(password);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show an error message", async () => {
      await expectAlertToBe("Unauthorized");
    });
  });

  test("Login with empty password", ({ given, when, then }) => {
    let username;

    given("User without password", async () => {
      username = "testlogin";
    });

    when("Trying to log in", async () => {
      const usernameInput = await page.$('[data-testid="log-username"] input');
      await usernameInput.type(username);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show an error message", async () => {
      await expectAlertToBe("Unauthorized");
    });
  });

  test("Login with incorrect password", ({ given, when, then }) => {
    let username;
    let wrongPassword;

    given("Registered user with incorrect password", async () => {
      username = "testlogin";
      wrongPassword = "WrongPass1!";
    });

    when("Trying to log in", async () => {
      const usernameInput = await page.$('[data-testid="log-username"] input');
      const passwordInput = await page.$('[data-testid="log-password"] input');
      await usernameInput.type(username);
      await passwordInput.type(wrongPassword);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show an error message", async () => {
      await expectAlertToBe("Unauthorized");
    });
  });

  test("Login with non-existing user", ({ given, when, then }) => {
    let username;
    let password;

    given("Not existent username", async () => {
      username = "nonexistentuser";
      password = "DoesntMatter123!";
    });

    when("Trying to log in", async () => {
      const usernameInput = await page.$('[data-testid="log-username"] input');
      const passwordInput = await page.$('[data-testid="log-password"] input');
      await usernameInput.type(username);
      await passwordInput.type(password);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show an error message", async () => {
      await expectAlertToBe("Unauthorized");
    });
  });
});