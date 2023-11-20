/*
  Warnings:

  - You are about to drop the `DesignType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DesignType";

-- CreateTable
CREATE TABLE "designs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canvasWidth" INTEGER NOT NULL,
    "canvasHeight" INTEGER NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "canvasImage" TEXT NOT NULL,
    "elements" TEXT NOT NULL,
    "fonts" TEXT[],

    CONSTRAINT "designs_pkey" PRIMARY KEY ("id")
);
