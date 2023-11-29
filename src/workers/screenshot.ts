import { screenshotQueue } from "../lib/queue";
import { takeScreenshot } from "../lib/screenshot";
import blocksRepo from "../repositories/blocks-repo";
import photoService from "../services/photos";

screenshotQueue.process(async (job, done) => {
    const { url, id, selector } = job.data;

    console.log("Taking screenshot of", url, "for block", id);
    const screenshot = await takeScreenshot(url, selector);
    const res = await photoService.uploadPhotoBuffer(screenshot, `block-uploads/${id}`);

    await blocksRepo.updateBlock(id, { url: res.url });
    done();
});