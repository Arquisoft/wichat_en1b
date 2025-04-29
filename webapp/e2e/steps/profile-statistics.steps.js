const puppeteer = require("puppeteer");
const { defineFeature, loadFeature } = require("jest-cucumber");
const setDefaultOptions = require("expect-puppeteer").setDefaultOptions;
const feature = loadFeature("./features/profile-statistics.feature");

let page;
let browser;

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
    process.env.JWT_SECRET='test-secret'

    await page.setViewport({ width: 1580, height: 800 });

    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
    });

    process.env.JWT_SECRET='test-secret'

    //Change the languaje to english
    await page.waitForSelector('[data-testid="ArrowDropDownIcon"]');
    await page.click('[data-testid="ArrowDropDownIcon"]');
    
    await page.waitForSelector('[data-value="en"]');
    await page.click('[data-value="en"]');

    // Go to Register page to create user
    await page.waitForSelector('button[data-testid="signup-button"]');
    await page.click('button[data-testid="signup-button"]');

    // Register a new user for login
    const usernameInput = await page.$('[data-testid="reg-username"] input');
    const passwordInput = await page.$('[data-testid="reg-password"] input');
    const confirmpasswordInput = await page.$('[data-testid="reg-confirmpassword"] input');

    await usernameInput.type("ProfileUser");
    await passwordInput.type("Password123!");
    await confirmpasswordInput.type("Password123!");

    await expect(page).toClick('[data-testid="signup"]');

  });

  afterAll(async () => {
    await browser.close();
  });

  afterEach(async () => {

    await page.waitForXPath('//button[contains(text(), "Home")]');
    const [homebutton] = await page.$x('//button[contains(text(), "Home")]');

    if(homebutton){

        await page.evaluate(el => el.scrollIntoView(), homebutton); // Asegura que esté visible
        await homebutton.click();
    }
    

  });

  test("Log and see the profile pannel", ({ given, when, then, and }) => {

    let username;
    let password;

    given("Existing user", async () => {
      username = "ProfileUser";
      password = "Password123!";

    });

    when("Logging in", async () => {
        
        await page.waitForXPath("//button[contains(text(), 'Sign out')]");
        const [signOutButton] = await page.$x("//button[contains(text(), 'Sign out')]");
        
    });

    then("Should be seen the home window", async () => {

        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homeButton] = await page.$x('//button[contains(text(), "Home")]');
        await page.evaluate(el => el.scrollIntoView(), homeButton);
        await homeButton.click();

    });

    and("Should be seen the profile pannel", async () =>{

        await page.waitForXPath('//h6[contains(text(), "Profile")]');
        const [profile] = await page.$x('//h6[contains(text(), "Profile")]');    
        const text = await page.evaluate(el => el.textContent, profile);
        expect(text).toMatch("Profile");
        
    });

  });

  test("Clicking the profile pannel", ({ given, when, then }) => {

    given("User in the home window", async () => {

        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homebutton] = await page.$x('//button[contains(text(), "Home")]');
        await homebutton.click();

    });

    when("Trying to click the profile pannel", async () => {

        await page.waitForXPath('//h6[contains(text(), "Profile")]');
        const [profilePanel] = await page.$x('//h6[contains(text(), "Profile")]');
        await profilePanel.click();

    });

    then("The users profile should be shown", async () => {

        const [profileTitle] = await page.$x('//h1[contains(text(), "ProfileUser")]');
        const text = await page.evaluate(el => el.textContent, profileTitle);
        expect(text).toMatch("ProfileUser");

    });

  });

  test("Changing the profile information", ({ given, when, then }) => {

    given("User in the profile pannel", async () => {

        await page.waitForXPath('//h6[contains(text(), "Profile")]');
        const [profilePanel] = await page.$x('//h6[contains(text(), "Profile")]');

        await profilePanel.click();

    });

    when("Trying to change the profile information", async () => {

        await page.waitForXPath('//button[contains(text(), "Account Settings")]');
        const [accountSettingsButton] = await page.$x('//button[contains(text(), "Account Settings")]');
        await accountSettingsButton.click();

        await page.waitForSelector('input[type="text"]');

        const checkbox = await page.$('input[type="checkbox"]');
        await checkbox.click();

        const usernameInput = await page.$('input[type="text"]');
        await usernameInput.type('UsernameChanged');

        const [saveChanges] = await page.$x('//button[contains(text(), "Save changes")]');
        await saveChanges.click();

    });

    then("The new information should be displayed", async () => {

        const [newName] = await page.$x('//h1[contains(text(), "UsernameChanged")]');
        const text = await page.evaluate(el => el.textContent, newName);
        expect(text).toMatch("UsernameChanged");
        
    });

  });

  test("Seeing the profile statistics", ({ given, when, then }) => {

    given("User in the profile pannel", async () => {

        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homebutton] = await page.$x('//button[contains(text(), "Home")]');

        await homebutton.click();

        await page.waitForXPath('//h6[contains(text(), "Profile")]');
        const [profilePanel] = await page.$x('//h6[contains(text(), "Profile")]');

        await profilePanel.click();

    });

    when("Watching the profile statistics", async () => {

        await page.waitForSelector('div[aria-label="Profile statistics tabs"]');
    
    // Check every statistic for every mode is displayed.

    const globalTab = await page.$x("//button[@role='tab' and contains(., 'Global')]");
    expect(globalTab).toBeDefined();
    
    const classicalTab = await page.$x("//button[@role='tab' and contains(., 'Classical')]");
    expect(classicalTab).toBeDefined();

    const suddenDeathTab = await page.$x("//button[@role='tab' and contains(., 'Sudden Death')]");
    expect(suddenDeathTab).toBeDefined();

    const timeTrialTab = await page.$x("//button[@role='tab' and contains(., 'Time Trial')]");
    expect(timeTrialTab).toBeDefined();

    const customTab = await page.$x("//button[@role='tab' and contains(., 'Custom')]");
    expect(customTab).toBeDefined();

    const qodTab = await page.$x("//button[@role='tab' and contains(., 'QOD')]");
    expect(qodTab).toBeDefined();

    });

    then("Everything should be correctly displayed", async () => {
        
        await page.waitForSelector('div[aria-label="Profile statistics tabs"]');

        // Check for the game modes
        const tabButtons = await page.$$('[role="tab"]');

        // Check every text in every tab
        for (const tabButton of tabButtons) {
            // click on the tab
            await tabButton.click();
            
            await page.waitForSelector('div.MuiBox-root');

            const [gamesPlayed] = await page.$x("//p[contains(text(), 'Games Played')]");
            const [questionsAnswered] = await page.$x("//p[contains(text(), 'Questions Answered')]");
            const [correctAnswers] = await page.$x("//p[contains(text(), 'Correct Answers')]");
            const [incorrectAnswers] = await page.$x("//p[contains(text(), 'Incorrect Answers')]");

            const gamesPlayedText = await page.evaluate(el => el.textContent, gamesPlayed);
            const questionsAnsweredText = await page.evaluate(el => el.textContent, questionsAnswered);
            const correctAnswersText = await page.evaluate(el => el.textContent, correctAnswers);
            const incorrectAnswersText = await page.evaluate(el => el.textContent, incorrectAnswers);

            expect(gamesPlayedText).toMatch("Games Played");
            expect(questionsAnsweredText).toMatch("Questions Answered");
            expect(correctAnswersText).toMatch("Correct Answers");
            expect(incorrectAnswersText).toMatch("Incorrect Answers");
        }
    });
  });
});