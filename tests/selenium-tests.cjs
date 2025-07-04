// tests/selenium-tests.cjs
const { Builder, By, until } = require('selenium-webdriver');
const { Options }          = require('selenium-webdriver/chrome');
const { ok, strictEqual }  = require('assert');

const BASE_URL    = process.env.BASE_URL || 'https://eduforums.up.railway.app';
const TEST_TIMEOUT = 30000;

describe('EduForums E2E Tests', function() {
  this.timeout(TEST_TIMEOUT);
  let driver;

  before(async () => {
    const options = new Options()
      .addArguments('--headless', '--disable-gpu', '--window-size=1280,800');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('signs up a new student and redirects to login', async () => {
    await driver.get(BASE_URL);
    // use xpath to click the <p> element
    await driver.findElement(By.xpath("//p[text()='Sign Up as Student']")).click();
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys('TestStudent');
    await driver.findElement(By.id('password')).sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/login-student'), 5000);
    const url = await driver.getCurrentUrl();
    ok(url.includes('/login-student'));
  });

  it('logs in the student and navigates to communities', async () => {
    // Now on /login-student
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys('TestStudent');
    await driver.findElement(By.id('password')).sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/communities'), 5000);
    const url = await driver.getCurrentUrl();
    ok(url.includes('/communities'));
  });

  it('allows admin to create and delete a community', async () => {
    // log out
    await driver.get(`${BASE_URL}/logout`);

    // signup-admin
    await driver.get(BASE_URL);
    await driver.findElement(By.xpath("//p[text()='Sign Up as Admin']")).click();
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys('TestAdmin');
    await driver.findElement(By.id('password')).sendKeys('adminpass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/login-admin'), 5000);

    // login-admin
    await driver.findElement(By.id('name')).sendKeys('TestAdmin');
    await driver.findElement(By.id('password')).sendKeys('adminpass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/communities'), 5000);

    // create community
    await driver.findElement(By.xpath("//button[contains(., 'Add Community')]")).click();
    await driver.wait(until.elementLocated(By.id('community-name')), 5000);
    await driver.findElement(By.id('community-name')).sendKeys('SeleniumTestComm');
    await driver.findElement(By.id('community-description')).sendKeys('Created by Selenium');
    await driver.findElement(By.css('button[type=\"submit\"]')).click();
    await driver.wait(until.elementLocated(By.xpath("//h2[text()='SeleniumTestComm']")), 5000);

    // delete community
    const deleteBtn = await driver.findElement(
      By.xpath("//h2[text()='SeleniumTestComm']/following-sibling::button[@aria-label='Delete community']")
    );
    await deleteBtn.click();
    await driver.sleep(1000);
    const elems = await driver.findElements(By.xpath("//h2[text()='SeleniumTestComm']"));
    strictEqual(elems.length, 0);
  });
});
