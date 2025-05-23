const puppeteer = require("puppeteer");
const { defineFeature, loadFeature } = require("jest-cucumber");
const setDefaultOptions = require("expect-puppeteer").setDefaultOptions;
const feature = loadFeature("./features/login-form.feature");

let page;
let browser;

const loginAlert = "Invalid username or password.";

// Función auxiliar para manejar XPaths visibles
const waitForVisibleXPath = async (page, xpath, timeout = 10000) => {
  await page.waitForXPath(xpath, { timeout });
  const [element] = await page.$x(xpath);
  return element;
};

// Función auxiliar para manejar Selectors visibles
const waitForVisibleSelector = async (page, selector, timeout = 10000) => {
  await page.waitForSelector(selector, { timeout });
  return await page.$(selector);
};

const expectAlertToBe = async (text) => {
  await page.waitForSelector('p[style="color: red;"]');
  const alertMessage = await page.$eval('p[style="color: red;"]', (el) => el.textContent);
  expect(alertMessage).toContain(text);
};

defineFeature(feature, (test) => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({
          headless: "new",
          slowMo: 50,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })
      : await puppeteer.launch({ headless: false, slowMo: 50 });

    page = await browser.newPage();
    setDefaultOptions({ timeout: 10000 });
    process.env.JWT_SECRET = 'test-secret';
    await page.setViewport({ width: 1580, height: 800 });
    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
    });

    // Change the language to English
    await page.waitForSelector('[data-testid="ArrowDropDownIcon"]');
    await page.click('[data-testid="ArrowDropDownIcon"]');
    
    await page.waitForSelector('[data-value="en"]');
    await page.click('[data-value="en"]');

    // Go to Register page to create user
    await page.waitForSelector('button[data-testid="signup-button"]');
    await page.click('button[data-testid="signup-button"]');

    // Register a new user for login
    const usernameInput = await waitForVisibleSelector(page, '[data-testid="reg-username"] input');
    const passwordInput = await waitForVisibleSelector(page, '[data-testid="reg-password"] input');
    const confirmpasswordInput = await waitForVisibleSelector(page, '[data-testid="reg-confirmpassword"] input');

    await usernameInput.type("loginuser");
    await passwordInput.type("StrongPass123!");
    await confirmpasswordInput.type("StrongPass123!");
    await expect(page).toClick('button[data-testid="signup"]');

    const signOutButton = await waitForVisibleXPath(page, "//button[contains(text(), 'Sign out')]");
    await signOutButton.click();

    await page.waitForSelector('[data-testid="login-button"]');
    await page.click('[data-testid="login-button"]');
  });

  afterAll(async () => {
    await browser.close();
  });

  afterEach(async () => {
    await page.waitForSelector('button[data-testid="login-button"]');
    await page.click('button[data-testid="login-button"]');
  });

  test("Login with valid credentials", ({ given, when, then }) => {
    process.env.JWT_SECRET = 'test-secret';
    let validUsername;
    let validPassword;

    given("Registered user with valid credentials", async () => {
      validUsername = "loginuser";
      validPassword = "StrongPass123!";
    });

    when("Logging in using the correct credentials", async () => {
      const usernameInput = await waitForVisibleSelector(page, '[data-testid="log-username"] input');
      const passwordInput = await waitForVisibleSelector(page, '[data-testid="log-password"] input');
      await usernameInput.type(validUsername);
      await passwordInput.type(validPassword);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show the home view", async () => {
      const signOutButton = await waitForVisibleXPath(page, "//button[contains(text(), 'Sign out')]");
      await signOutButton.click();
    });
  });

  test("Login with empty username", ({ given, when, then }) => {
    let password;

    given("User without username", async () => {
      password = "StrongPass123!";
    });

    when("Trying to log in", async () => {
      const passwordInput = await waitForVisibleSelector(page, '[data-testid="log-password"] input');
      await passwordInput.type(password);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show an error message", async () => {
      await expectAlertToBe("Some of the fields are missing.");
    });
  });

  test("Login with empty password", ({ given, when, then }) => {
    let username;

    given("User without password", async () => {
      username = "testlogin";
    });

    when("Trying to log in", async () => {
      const usernameInput = await waitForVisibleSelector(page, '[data-testid="log-username"] input');
      await usernameInput.type(username);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show an error message", async () => {
      await expectAlertToBe("Some of the fields are missing.");
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
      const usernameInput = await waitForVisibleSelector(page, '[data-testid="log-username"] input');
      const passwordInput = await waitForVisibleSelector(page, '[data-testid="log-password"] input');
      await usernameInput.type(username);
      await passwordInput.type(wrongPassword);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should show an error message", async () => {
      await expectAlertToBe(loginAlert);
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
      const usernameInput = await waitForVisibleSelector(page, '[data-testid="log-username"] input');
      const passwordInput = await waitForVisibleSelector(page, '[data-testid="log-password"] input');
      await usernameInput.type(username);
      await passwordInput.type(password);
      await expect(page).toClick('button[type="submit"]');

    });

    then("Should show an error message", async () => {
      await expectAlertToBe(loginAlert);
    });

  });

});
