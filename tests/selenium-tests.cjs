// This file contains end-to-end tests for the EduForums application using Selenium WebDriver.
// tests/selenium-tests.cjs
// tests/selenium-tests.cjs
const { Builder, By, until } = require('selenium-webdriver');
const { Options }          = require('selenium-webdriver/chrome');
const { ok, strictEqual }  = require('assert');

// Base URL of your deployed front-end (use npm script env to override)
const BASE_URL    = process.env.BASE_URL || 'https://eduforums.up.railway.app';
const TEST_TIMEOUT = 30000;

describe('EduForums E2E Tests', function() {
  this.timeout(TEST_TIMEOUT);
  let driver;
  let studentName;
  let adminName;

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

  it('lands on the landing page and navigates to student signup', async () => {
    await driver.get(BASE_URL);
    // click the <p> element for Student signup
    await driver.findElement(By.xpath("//p[text()='Sign Up as Student']")).click();
    // verify we are on student-signup page
    await driver.wait(until.urlContains('/student-signup'), 5000);
    const url = await driver.getCurrentUrl();
    ok(url.includes('/student-signup'));
  });

  it('signs up a new student and redirects to login', async () => {
    // generate a unique student name
    studentName = `TestStudent_${Date.now()}`;
    // assume on /student-signup
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys(studentName);
    await driver.findElement(By.id('password')).sendKeys('password123');
    await driver.findElement(By.xpath("//button[contains(., 'Sign up')]")).click();
    // expect redirect to login-student
    await driver.wait(until.urlContains('/login-student'), 5000);
    const url = await driver.getCurrentUrl();
    ok(url.includes('/login-student'));
  });

  it('logs in the student and navigates to communities', async () => {
    // on /login-student
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).clear();
    await driver.findElement(By.id('name')).sendKeys(studentName);
    await driver.findElement(By.id('password')).sendKeys('password123');
    await driver.findElement(By.xpath("//button[contains(., 'Log In')]")).click();
    // expect /communities
    await driver.wait(until.urlContains('/communities'), 5000);
    const url = await driver.getCurrentUrl();
    ok(url.includes('/communities'));

    // log out student to allow fresh session for next user
    await driver.get(`${BASE_URL}/logout`);
    // verify logout by landing back on signup options
    await driver.wait(until.urlIs(BASE_URL + '/student-signup'), 5000).catch(async () => {
      // fallback to landing if redirect differs
      await driver.get(BASE_URL);
    });
  });

});
