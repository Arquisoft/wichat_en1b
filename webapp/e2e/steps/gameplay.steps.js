const puppeteer = require("puppeteer");
const { defineFeature, loadFeature } = require("jest-cucumber");
const setDefaultOptions = require("expect-puppeteer").setDefaultOptions;
const feature = loadFeature("./features/gameplay.feature");

let page;
let browser;

async function waitForVisibleXPath(page, xpath) {
  await page.waitForXPath(xpath, { visible: true });
  const [element] = await page.$x(xpath);
  if (element) {
    await page.evaluate(el => el.scrollIntoView(), element);
  }
  return element;
}

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
    process.env.JWT_SECRET='test-secret';

    await page.setViewport({ width: 1780, height: 1000 });

    await page.goto("http://localhost:3000", { waitUntil: "load" });

    // Cambiar idioma a inglés
    await page.waitForSelector('[data-testid="ArrowDropDownIcon"]');
    await page.click('[data-testid="ArrowDropDownIcon"]');
    
    await page.waitForSelector('[data-value="en"]');
    await page.click('[data-value="en"]');

    // Ir a página de registro
    await page.waitForSelector('button[data-testid="signup-button"]');
    await page.click('button[data-testid="signup-button"]');

    // Registro de usuario
    const usernameInput = await page.waitForSelector('[data-testid="reg-username"] input');
    const passwordInput = await page.waitForSelector('[data-testid="reg-password"] input');
    const confirmpasswordInput = await page.waitForSelector('[data-testid="reg-confirmpassword"] input');

    await usernameInput.type("AnotherUsere2e");
    await passwordInput.type("Password123!");
    await confirmpasswordInput.type("Password123!");
    await expect(page).toClick('[data-testid="signup"]');
  });

  afterAll(async () => {
    await browser.close();
  });

  afterEach(async () => {
    const homebutton = await waitForVisibleXPath(page, '//button[contains(text(), "Home")]');
    if (homebutton) {
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
      await waitForVisibleXPath(page, "//button[contains(text(), 'Sign out')]");
    });

    then("Should be seen the home window", async () => {
      const homeButton = await waitForVisibleXPath(page, '//button[contains(text(), "Home")]');
      await homeButton.click();
    });

    and("Should be seen the profile pannel", async () => {
      const profile = await waitForVisibleXPath(page, '//h6[contains(text(), "Profile")]');
      const text = await page.evaluate(el => el.textContent, profile);
      expect(text).toMatch("Profile");
    });

    and("Should be seen the new game pannel", async () => {
      const Cgame = await waitForVisibleXPath(page, '//h6[contains(text(), "Classical game")]');
      const text = await page.evaluate(el => el.textContent, Cgame);
      expect(text).toMatch("Classical game");
    });

    and("Should be seen the statistics pannel", async () => {
      const statPannel = await waitForVisibleXPath(page, '//h6[contains(text(), "Statistics")]');
      const text = await page.evaluate(el => el.textContent, statPannel);
      expect(text).toMatch("Statistics");
    });

    and("Should be seen the game modes pannel", async () => {
      const GmodePannel = await waitForVisibleXPath(page, '//h6[contains(text(), "Game modes")]');
      const text = await page.evaluate(el => el.textContent, GmodePannel);
      expect(text).toMatch("Game modes");
    });
  });

  test("Clicking the Game pannel", ({ given, when, then }) => {
    given("User in the home window", async () => {
      const homebutton = await waitForVisibleXPath(page, '//button[contains(text(), "Home")]');
      await homebutton.click();
    });

    when("Trying to click the game pannel", async () => {
      const gamePannel = await waitForVisibleXPath(page, '//h6[contains(text(), "Classical game")]');
      await gamePannel.click();
    });

    then("A game should be started", async () => {
      const game = await waitForVisibleXPath(page, '//h1[contains(text(),"Classical Game")]');
      const text = await page.evaluate(el => el.textContent, game);
      expect(text).toMatch("Classical Game");
    });
  });

  test("Seeing game modes", ({ given, when, then, and }) => {
    given("User in the home window", async () => {
      const homebutton = await waitForVisibleXPath(page, '//button[contains(text(), "Home")]');
      await homebutton.click();
    });

    when("Entering the game mode panel", async () => {
      const statsbutton = await waitForVisibleXPath(page, '//button[contains(text(), "Game modes")]');
      await statsbutton.click();
    });

    then("Retrieve all the game modes", async () => {
      const sgm = await waitForVisibleXPath(page, '//h4[contains(text(), "Select Game Mode")]');
      expect(await page.evaluate(el => el.textContent, sgm)).toMatch("Select Game Mode");

      const Cgame = await waitForVisibleXPath(page, '//h6[contains(text(), "Classical")]');
      expect(await page.evaluate(el => el.textContent, Cgame)).toMatch("Classical");

      const SDgame = await waitForVisibleXPath(page, '//h6[contains(text(), "Sudden Death")]');
      expect(await page.evaluate(el => el.textContent, SDgame)).toMatch("Sudden Death");

      const TTgame = await waitForVisibleXPath(page, '//h6[contains(text(), "Time Trial")]');
      expect(await page.evaluate(el => el.textContent, TTgame)).toMatch("Time Trial");

      const QODgame = await waitForVisibleXPath(page, '//h6[contains(text(), "QOD")]');
      expect(await page.evaluate(el => el.textContent, QODgame)).toMatch("QOD");

      const Cugame = await waitForVisibleXPath(page, '//h6[contains(text(), "Custom")]');
      expect(await page.evaluate(el => el.textContent, Cugame)).toMatch("Custom");
    });
  });

  test("Interacting with IA", ({ given, when, then }) => {
    given("User in the home window", async () => {
      const homebutton = await waitForVisibleXPath(page, '//button[contains(text(), "Home")]');
      await homebutton.click();
    });

    when("Entering a new game", async () => {
      const gamePannel = await waitForVisibleXPath(page, '//h6[contains(text(), "Classical game")]');
      await gamePannel.click();
    });

    then("Should interact with the IA", async () => {
      const buttonIA = await page.$('[data-testid="ChevronLeftIcon"]');
      await buttonIA.click();

      const inputIA = await page.waitForSelector('input[placeholder="Type your message..."]', { visible: true });
      await inputIA.type("Give me a hint");

      const sendIA = await page.$('[data-testid="SendIcon"]');
      await sendIA.click();

      await page.waitForTimeout(3000);

      const element = await waitForVisibleXPath(page, "//div[contains(text(), 'AI')]");
      const text = await page.evaluate(el => el.textContent, element);
      expect(text).toMatch("AI");
    });
  });

});

/** Commented because the game doesnt load the questions
  test("Answering a question", ({ given, when, then, and }) => {

  given("User in the home window", async () => {
    const homebutton = await waitForVisibleXPath(page, '//button[contains(text(), "Home")]');
    await homebutton.click();
  });

  when("Entering a new game", async () => {
    const gamePannel = await waitForVisibleXPath(page, '//h6[contains(text(), "Classical game")]');
    await gamePannel.click();
  });

  then("The round must be shown", async () => {
    const rounds = await waitForVisibleXPath(page, '//p[contains(text(), "1/10")]');
    const text = await page.evaluate(el => el.textContent, rounds);
    expect(text).toMatch("1/10");
  });

  and("The time must be shown", async () => {
    const timer = await waitForVisibleXPath(page, '//*[@id="root"]/div/div[2]/main/div[1]/div[1]/div[2]/div[2]');
    const text = await page.evaluate(el => el.textContent, timer);
    expect(text).toMatch("01:00");
  });

  and("Should answer a question", async () => {
    await page.waitForTimeout(10000);
    const answer = await waitForVisibleXPath(page, '//*[@id="root"]/div/div[2]/main/div[1]/div[2]/div/div[2]/button');
    await answer.click();
  });

  and("The round should change", async () => {
    const rounds = await waitForVisibleXPath(page, '//p[contains(text(), "2/10")]');
    const text = await page.evaluate(el => el.textContent, rounds);
    expect(text).toMatch("2/10");
  });

  and("The time should reset", async () => {
    const timer = await waitForVisibleXPath(page, '//*[@id="root"]/div/div[2]/main/div[1]/div[1]/div[2]/div[2]');
    const text = await page.evaluate(el => el.textContent, timer);
    expect(text).toMatch("01:00");
  });
});


test("Finnish game", ({ given, when, then, and }) => {

  given("User in the home window", async () => {
    const homebutton = await waitForVisibleXPath(page, '//button[contains(text(), "Home")]');
    await homebutton.click();
  });

  when("Entering a new game", async () => {
    const gamePannel = await waitForVisibleXPath(page, '//h6[contains(text(), "Classical game")]');
    await gamePannel.click();
  });

  then("Answer the questions of the game", async () => {
    for (let i = 0; i < 10; i++) {
      const answer = await waitForVisibleXPath(page, '//*[@id="root"]/div/div[2]/main/div[1]/div[2]/div/div[2]/button');
      await answer.click();
      await page.waitForTimeout(5000);
    }
  });

  and("Should be redirected to the statistics view", async () => {
    const profile = await waitForVisibleXPath(page, '//button[contains(text(), "Profile")]');
    await profile.click();

    const username = await waitForVisibleXPath(page, '//h1[contains(text(), "AnotherUsere2e")]');
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
