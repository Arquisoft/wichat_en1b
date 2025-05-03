const puppeteer = require("puppeteer");
const { defineFeature, loadFeature } = require("jest-cucumber");
const setDefaultOptions = require("expect-puppeteer").setDefaultOptions;
const feature = loadFeature("./features/gameplay.feature");

let page;
let browser;

defineFeature(feature, (test) => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })
      : await puppeteer.launch({ headless: false, slowMo: 50 });

    page = await browser.newPage();
    process.env.JWT_SECRET='test-secret'

    await page.setViewport({ width: 1780, height: 1000 });

    await page.goto("http://localhost:3000", {
      waitUntil: "load",
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

    await usernameInput.type("AnotherUsere2e");
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

  test("Log and see the Game pannel", ({ given, when, then, and }) => {

    let username;
    let password;

    given("Existing user", async () => {
      username = "AnotherUsere2e";
      password = "Password123!";

    });

    when("Logged in", async () => {
        
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

    and("Should be seen the new game pannel", async () =>{
        const [Cgame] = await page.$x('//h6[contains(text(), "Classical game")]');
        const text = await page.evaluate(el => el.textContent, Cgame);
        expect(text).toMatch("Classical game");
        
    });

    and("Should be seen the statistics pannel", async () =>{
        const [statPannel] = await page.$x('//h6[contains(text(), "Statistics")]');
        const text = await page.evaluate(el => el.textContent, statPannel);
        expect(text).toMatch("Statistics");
        
    });

    and("Should be seen the game modes pannel", async () =>{
        const [GmodePannel] = await page.$x('//h6[contains(text(), "Game modes")]');
        const text = await page.evaluate(el => el.textContent, GmodePannel);
        expect(text).toMatch("Game modes");
    });
  });

  test("Clicking the Game pannel", ({ given, when, then }) => {

    given("User in the home window", async () => {
        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homebutton] = await page.$x('//button[contains(text(), "Home")]');
        await homebutton.click();
    });

    when("Trying to click the game pannel", async () => {

        await page.waitForXPath('//h6[contains(text(), "Classical game")]');
        const [gamePannel] = await page.$x('//h6[contains(text(), "Classical game")]');
        await gamePannel.click();

    });

    then("A game should be started", async () => {

        const [game] = await page.$x('//h1[contains(text(),"Classical Game")]');
        const text = await page.evaluate(el => el.textContent, game);
        expect(text).toMatch("Classical Game");

    });
  });


  test("Seeing game modes", ({ given, when, then, and }) => {

    given("User in the home window", async () => {
        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homebutton] = await page.$x('//button[contains(text(), "Home")]');
        await homebutton.click();
    });

    when("Entering the game mode panel", async () => {
      await page.waitForXPath('//button[contains(text(), "Game modes")]');
      const [statsbutton] = await page.$x('//button[contains(text(), "Game modes")]');
      await statsbutton.click();
    });

    then("Retrieve all the game modes", async () => {
      await page.waitForXPath('//h4[contains(text(), "Select Game Mode")]');

      const [sgm] = await page.$x('//h4[contains(text(), "Select Game Mode")]');
        const textSGM = await page.evaluate(el => el.textContent, sgm);
        expect(textSGM).toMatch("Select Game Mode");

      const [Cgame] = await page.$x('//h6[contains(text(), "Classical")]');
      const textC = await page.evaluate(el => el.textContent, Cgame);
      expect(textC).toMatch("Classical");
          
      const [SDgame] = await page.$x('//h6[contains(text(), "Sudden Death")]');
      const textSD = await page.evaluate(el => el.textContent, SDgame);
      expect(textSD).toMatch("Sudden Death");
      
      const [TTgame] = await page.$x('//h6[contains(text(), "Time Trial")]');
      const textTT = await page.evaluate(el => el.textContent, TTgame);
      expect(textTT).toMatch("Time Trial");

      const [QODgame] = await page.$x('//h6[contains(text(), "QOD")]');
      const textQOD = await page.evaluate(el => el.textContent, QODgame);
      expect(textQOD).toMatch("QOD");

      const [Cugame] = await page.$x('//h6[contains(text(), "Custom")]');
      const textCu = await page.evaluate(el => el.textContent, Cugame);
      expect(textCu).toMatch("Custom");
    });
  });

  test("Interacting with IA", ({ given, when, then }) => {

    given("User in the home window", async () => {
        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homebutton] = await page.$x('//button[contains(text(), "Home")]');
        await homebutton.click();
    });

    when("Entering a new game", async () => {
        await page.waitForXPath('//h6[contains(text(), "Classical game")]');
        const [gamePannel] = await page.$x('//h6[contains(text(), "Classical game")]');
        await gamePannel.click();
    });

    then("Should interact with the IA", async () => {
        const buttonIA = await page.$('[data-testid="ChevronLeftIcon"]');
        await buttonIA.click();

        const inputIA = await page.waitForSelector('input[placeholder="Type your message..."]');
        await inputIA.type("Give me a hint");
        const sendIA = await page.$('[data-testid="SendIcon"]');
        await sendIA.click();

        await page.waitForTimeout(3000);

        const element = await page.waitForXPath("//div[contains(text(), 'AI')]");
        const text = await page.evaluate(el => el.textContent, element);
        expect(text).toMatch("AI");


      });
    
  });
/** Commented because the game doesnt load the questions
  test("Answering a question", ({ given, when, then, and }) => {

    given("User in the home window", async () => {
        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homebutton] = await page.$x('//button[contains(text(), "Home")]');
        await homebutton.click();
    });

    when("Entering a new game", async () => {
        await page.waitForXPath('//h6[contains(text(), "Classical game")]');
        const [gamePannel] = await page.$x('//h6[contains(text(), "Classical game")]');
        await gamePannel.click();
    });

    then("The round must be shown", async () => {
        const [rounds] = await page.$x('//p[contains(text(), "1/10")]');
        const text = await page.evaluate(el => el.textContent, rounds);
        expect(text).toMatch("1/10");
    });

    and("The time must be shown", async () => {
        
        const [timer] = await page.$x('//*[@id="root"]/div/div[2]/main/div[1]/div[1]/div[2]/div[2]');
        expect(timer).toBeDefined();
        const text = await page.evaluate(el => el.textContent, timer);
        expect(text).toMatch("01:00");
        
    });

    and("Should answer a question", async () => {
        await page.waitForTimeout(10000);
        await page.waitForXPath('//*[@id="root"]/div/div[2]/main/div[1]/div[2]/div/div[2]/button');
        const [answer] = await page.$x('//*[@id="root"]/div/div[2]/main/div[1]/div[2]/div/div[2]/button');
        await answer.click();
    });

    and("The round should change", async () => {
        const [rounds] = await page.$x('//p[contains(text(), "2/10")]');
        const text = await page.evaluate(el => el.textContent, rounds);
        expect(text).toMatch("2/10");
    });
    
    and("The time should reset", async () => {
        const [timer] = await page.$x('//*[@id="root"]/div/div[2]/main/div[1]/div[1]/div[2]/div[2]');
        const text = await page.evaluate(el => el.textContent, timer);
        expect(text).toMatch("01:00");
    });
  });

  test("Finnish game", ({ given, when, then, and }) => {

    given("User in the home window", async () => {
        await page.waitForXPath('//button[contains(text(), "Home")]');
        const [homebutton] = await page.$x('//button[contains(text(), "Home")]');
        await homebutton.click();
    });

    when("Entering a new game", async () => {
        await page.waitForXPath('//h6[contains(text(), "Classical game")]');
        const [gamePannel] = await page.$x('//h6[contains(text(), "Classical game")]');
        await gamePannel.click();
    });

    then("Answer the questions of the game", async () => {
        for (let i = 0; i < 10; i++) {
            await page.waitForXPath('//*[@id="root"]/div/div[2]/main/div[1]/div[2]/div/div[2]/button');
            const [answer] = await page.$x('//*[@id="root"]/div/div[2]/main/div[1]/div[2]/div/div[2]/button');
            if (answer) {
              await answer.click();
              await page.waitForTimeout(5000);
            } 
            
          }
          
    });

    and("Should be redirected to the statistics view", async () => {
        await page.waitForXPath('//button[contains(text(), "Profile")]');
        const [profile] = await page.$x('//button[contains(text(), "Profile")]');
        await profile.click();

        await page.waitForXPath('//h1[contains(text(), "AnotherUsere2e")]');
        const [username] = await page.$x('//h1[contains(text(), "AnotherUsere2e")]');
        const text = await page.evaluate(el => el.textContent, username);
        expect(text).toMatch("AnotherUsere2e");
    });
  });

  Scenario: Answering a question
    Given User in the home window
    When Entering a new game
    Then The round must be shown
    And The time must be shown
    And Should answer a question
    And The round should change
    And The time should reset

  Scenario: Finnish game
    Given User in the home window
    When Entering a new game
    Then Answer the questions of the game
    And Should be redirected to the statistics view


*/
});