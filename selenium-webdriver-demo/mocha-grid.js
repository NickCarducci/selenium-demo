const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');
const GRID_URL = 'http://localhost:4444/wd/hub';// 5678
describe('Vote', () => {
    let driver;
    before(async function () {
        this.timeout(30000); // Increase timeout for Selenium operations
        //Initialize
        driver = await new Builder().usingServer(GRID_URL).forBrowser('chrome').build();
        await driver.get('http://localhost:4567'); // VoteLab port

        await driver.manage().setTimeouts({ implicit: 4000 });
    });
    after(async function () {

        // Clean up
        await driver.quit();
    });

    it('should vote and read results', async () => {

        await driver.get('http://localhost:4567'); // VoteLab port

        let resultsButton = await driver.findElement(By.xpath("//a[text()='Results']"));
        await resultsButton.click();
        const initialRowCount = await driver.findElement(By.xpath("//tr[th[text()='Hamberger']]/td"));
        // NEW
        var initialCount = await initialRowCount.getText();
        console.log("the count before vote, for Hamberger:", initialCount);

        let homeButton = await driver.findElement(By.xpath("//a[text()='Vote']"));
        await homeButton.click();

        let radioInputHam = await driver.findElement(By.id('vote_HAM'));
        await radioInputHam.click();

        // Submit vote
        let castThisVote = await driver.findElement(By.xpath("//button[text()='Cast this vote!']"));
        await castThisVote.click();

        let confirmationText = await driver.findElement(By.css('h2'));
        let confirmedVote = await driver.findElement(By.css('p'));
        console.log('~~Confirmed~~:', await confirmationText.getText(), await confirmedVote.getText());

        let seeTheResults = await driver.findElement(By.xpath("//button[text()='See the Results']"));
        await seeTheResults.click();

        // Log results to console (& assert for mochawesome report)
        const rowCount = await driver.findElement(By.xpath("//tr[th[text()='Hamberger']]/td"));
        // NEW
        const count = await rowCount.getText();
        console.log("initial total:", initialCount);
        console.log("Hamberger vote total:", count);
        console.log("---");

        // Assuming count is initialCount + 1
        assert.strictEqual(count, initialCount++, `ERROR from node.js assertion library: count total ${count} is not one more than it was (${initialCount}) before the vote`);
    });
});