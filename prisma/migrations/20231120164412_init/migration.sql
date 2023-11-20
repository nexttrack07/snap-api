-- CreateTable
CREATE TABLE "DesignType" (
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

    CONSTRAINT "DesignType_pkey" PRIMARY KEY ("id")
);
