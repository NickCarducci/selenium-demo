const { Builder, By, Key, until } = require('selenium-webdriver');

async function runTest() {
    // or 'firefox'
    let driver = await new Builder().forBrowser('chrome').build();
    // When you initialize the webdriver in the selenium-webdriver package,
    // Selenium Manager downloads the compatible WebDriver executable.

    try {
        await driver.get('http://localhost:4567'); // VoteLab port

        let resultsButton = await driver.findElement(By.xpath("//a[text()='Results']"));
        await resultsButton.click();
        //const rowHeader = await driver.findElement(By.xpath(`//th[contains(text(), 'Hamberger')]`));
        //const row = await rowHeader.findElement(By.xpath('./parent::tr'));
        //const initialRowCount = await row.findElement(By.xpath(`.//th[contains(text(), 'Hamberger')]/following-sibling::td`));
        const initialRowCount = await driver.findElement(By.xpath("//tr[th[text()='Hamberger']]/td"));
        console.log("the count before vote, for Hamberger:", await initialRowCount.getText());

        let homeButton = await driver.findElement(By.xpath("//a[text()='Vote']"));
        await homeButton.click();
        console.log("home");

        let radioInputHam = await driver.findElement(By.id('vote_HAM'));
        await radioInputHam.click();
        console.log("selected");

        // Submit vote
        let castThisVote = await driver.findElement(By.xpath("//button[text()='Cast this vote!']"));
        await castThisVote.click();
        console.log("voted");

        let confirmationText = await driver.findElement(By.css('h2'));
        let confirmedVote = await driver.findElement(By.css('p'));
        console.log('~~Confirmed~~:', await confirmationText.getText(), await confirmedVote.getText());

        let seeTheResults = await driver.findElement(By.xpath("//button[text()='See the Results']"));
        await seeTheResults.click();
        
        // Log results to console
        const rowCount = await driver.findElement(By.xpath("//tr[th[text()='Hamberger']]/td"));
        console.log("Hamberger vote total:", await rowCount.getText());
        console.log("---");

    } finally {

        // Clean up
        await driver.quit();
    }
}

runTest();