// selenium-tests.js
// Automated end-to-end tests for EduForums using Selenium WebDriver + Mocha

import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { ok, strictEqual } from 'assert';

// Base URL of your deployed front-end
const BASE_URL = 'https://eduforums.up.railway.app';
// Increase timeout for slower CI environments
const TEST_TIMEOUT = 30000;

describe('EduForums E2E Tests', function() {
  let driver;
  this.timeout(TEST_TIMEOUT);

  before(async () => {
    // Use headless Chrome for CI
    const options = new Options().headless();
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async () => {
    await driver.quit();
  });

  it('should sign up a new student and redirect to login', async () => {
    await driver.get(BASE_URL);
    // Click "Sign Up as Student"
    await driver.findElement(By.linkText('Sign Up as Student')).click();
    // Wait for signup form
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    // Fill form
    await driver.findElement(By.id('name')).sendKeys('TestStudent');
    await driver.findElement(By.id('password')).sendKeys('password123');
    // Submit
    await driver.findElement(By.css('button[type="submit"]')).click();
    // Expect redirect to /login-student
    await driver.wait(until.urlContains('/login-student'), 5000);
    const url = await driver.getCurrentUrl();
    ok(url.includes('/login-student'));
  });

  it('should log in the student and navigate to communities', async () => {
    // We're on /login-student
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys('TestStudent');
    await driver.findElement(By.id('password')).sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    // Expect navigation to /communities
    await driver.wait(until.urlContains('/communities'), 5000);
    const url = await driver.getCurrentUrl();
    ok(url.includes('/communities'));
  });

  it('should allow admin to create and delete a community', async () => {
    // Log out first
    await driver.get(BASE_URL + '/logout');
    // Sign up as admin
    await driver.get(BASE_URL);
    await driver.findElement(By.linkText('Sign Up as Admin')).click();
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys('TestAdmin');
    await driver.findElement(By.id('password')).sendKeys('adminpass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    // Redirect to login-admin
    await driver.wait(until.urlContains('/login-admin'), 5000);
    // Log in as admin
    await driver.findElement(By.id('name')).sendKeys('TestAdmin');
    await driver.findElement(By.id('password')).sendKeys('adminpass');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/communities'), 5000);

    // Create a new community
    await driver.findElement(By.text('Add Community')).click();
    await driver.wait(until.elementLocated(By.id('community-name')), 5000);
    await driver.findElement(By.id('community-name')).sendKeys('SeleniumTestComm');
    await driver.findElement(By.id('community-description')).sendKeys('Created by Selenium');
    await driver.findElement(By.css('button[type="submit"]')).click();
    // Back to communities list
    await driver.wait(until.elementLocated(By.xpath("//h2[text()='SeleniumTestComm']")), 5000);

    // Delete that community
    const deleteBtn = await driver.findElement(By.xpath("//h2[text()='SeleniumTestComm']/../button[@aria-label='Delete community']"));
    await deleteBtn.click();
    // Confirm it is removed
    await driver.sleep(1000);
    const elems = await driver.findElements(By.xpath("//h2[text()='SeleniumTestComm']"));
    strictEqual(elems.length, 0);
  });
});

// To run: mocha selenium-tests.js
// Ensure chromedriver is installed and on PATH
