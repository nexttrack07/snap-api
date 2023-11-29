import  Queue from "bull";

export const screenshotQueue = new Queue("screenshot", process.env.REDIS_URL as string);