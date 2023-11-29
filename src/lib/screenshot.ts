import puppeteer from 'puppeteer';

export async function takeScreenshot(url: string, selector: string): Promise<Buffer> {
    try {
        console.log('Taking screenshot of', url, 'for selector', selector);
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' }); // Waits for the network to be idle (no ongoing requests for 500ms)

        // Wait for the element defined by selector to be loaded
        await page.waitForSelector(selector, { visible: true });

        // Select the element and take a screenshot
        const element = await page.$(selector);
        if (!element) {
            throw new Error(`Element not found for selector: ${selector}`);
        }
        const screenshot = await element.screenshot();

        await browser.close();
        return screenshot;
    } catch (error: any) {
        console.error('Error taking screenshot:', error.message);
        throw new Error(`Failed to take screenshot of ${url} for selector ${selector}: ${error.message}`);
    }
}
