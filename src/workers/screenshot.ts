import Queue from "bull";
import { takeScreenshot } from "../lib/screenshot";
import blocksRepo from "../repositories/blocks-repo";
import photoService from "../services/photos";

const screenshotQueue = new Queue("screenshot", process.env.REDIS_URL as string);

screenshotQueue.process(async (job, done) => {
    const { url, id, selector } = job.data;

    console.log("Taking screenshot of", url, "for block", id);

    try {
        const screenshot = await takeScreenshot(url, selector);
        const res = await photoService.uploadPhotoBuffer(screenshot, `block-uploads/${id}`);
        await blocksRepo.updateBlock(id, { url: res.url });
        done(); // Complete the job successfully
    } catch (err: any) {
        console.error('Error processing job:', err);
        done(err); // Pass the error to Bull
    }
});

export { screenshotQueue };