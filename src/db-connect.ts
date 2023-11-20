import { PrismaClient } from "@prisma/client";
import IORedis from "ioredis";

export const prisma = new PrismaClient();
export const redis = new IORedis(process.env.REDIS_URL as string);