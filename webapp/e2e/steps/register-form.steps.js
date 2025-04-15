const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register-form.feature');

let page;
let browser;

const expectAlertToBe = async (text) => {
  await page.waitForSelector('div[role="alert"]');
  const alertMessage = await page.$eval('div[role="alert"]', 
    (x) => x.textContent);
  expect(alertMessage).toContain(text);
};

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 10000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});

    // Wait for the navbar and click the "Register" button
    await page.waitForSelector('button[data-testid="register-nav"]');
    await page.click('button[data-testid="register-nav"]');

  });

  afterAll(async () => {
    await browser.close();
  });

  afterEach(async () => {
    // Navigate to home to clear register inputs
    await page.waitForSelector('button[data-testid="home-nav"]');
    await page.click('button[data-testid="home-nav"]');
    // Navigate back to the register page after each test
    await page.waitForSelector('button[data-testid="register-nav"]');
    await page.click('button[data-testid="register-nav"]');
  });
  
  test("Register user with valid credentials", ({ given, when, then }) => {
    let username1;
    let password1;

    given("An unregistered user with valid credentials", async () => {
      username1 = "UserTest1";
      password1 = "StrongPass100!";
    });

    when("Filling in the register form and submit", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(username1);
      await passwordInput.type(password1);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown a success message", async () => {
      expectAlertToBe("User added successfully");
    });
  });

  test("Register an existing user", ({ given, when, then }) => {
    let existingUsername;
    let password2;

    given("User that already exists", async () => {
      existingUsername = "UserTest1";
      password2 = "StrongPass101!";
    });

    when("Trying to register with existing username", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(existingUsername);
      await passwordInput.type(password2);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown an user already existing error message", async () => {
      expectAlertToBe("Unauthorized");
    });
  });

  test("Register with invalid data - Long username", ({ given, when, then }) => {
    let longUsername;
    let password3;

    given("User with a long invalid username", async () => {
      longUsername = "UserTestVeryLongName1"; // 21 characters
      password3 = "StrongPass124!";
    });

    when("Trying to register", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(longUsername);
      await passwordInput.type(password3);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown an error message", async () => {
      expectAlertToBe("Bad Request");
    });
  });

  test("Register with invalid data - Short username", ({ given, when, then }) => {
    let shortUsername;
    let password4;

    given("User with a short invalid username", async () => {
      shortUsername = "mi"; // 4 characters
      password4 = "StrongPass102!";
    });

    when("Trying to register", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(shortUsername);
      await passwordInput.type(password4);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown an error message", async () => {
      expectAlertToBe("Bad Request");
    });
  });

  test("Register with invalid data - Empty username", ({ given, when, then }) => {
    let emptyUsername;
    let password5;

    given("User with an empty username", async () => {
      emptyUsername = "";
      password5 = "StrongPass104!";
    });

    when("Trying to register", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(emptyUsername);
      await passwordInput.type(password5);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown an error message", async () => {
      expectAlertToBe("Bad Request");
    });
  });

  test("Register with invalid data - Non-alphanumeric username", ({ given, when, then }) => {
    let invalidUsername;
    let password6;

    given("User with special characters in the username", async () => {
      invalidUsername = "UserTest2@!";
      password6 = "StrongPass103!";
    });

    when("Trying to register", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(invalidUsername);
      await passwordInput.type(password6);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown an error message", async () => {
      expectAlertToBe("Bad Request");
    });
  });

  test("Register with invalid data - Weak password", ({ given, when, then }) => {
    let username2;
    let weakPassword;

    given("User with a weak password", async () => {
      username2 = "UserTest4";
      weakPassword = "weak";
    });

    when("Trying to register", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(username2);
      await passwordInput.type(weakPassword);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown an error message", async () => {
      expectAlertToBe("Bad Request");
    });
  });

  test("Register with invalid data - Empty password", ({ given, when, then }) => {
    let username3;
    let emptyPassword;

    given("User with an empty password", async () => {
      username3 = "UserTest3";
      emptyPassword = "";
    });

    when("Trying to register", async () => {
      const usernameInput = await page.$('[data-testid="reg-username"] input');
      const passwordInput = await page.$('[data-testid="reg-password"] input');

      await usernameInput.type(username3);
      await passwordInput.type(emptyPassword);
      await expect(page).toClick('button[type="submit"]');
    });

    then("Should be shown an error message", async () => {
      expectAlertToBe("Bad Request");
    });
  });
});