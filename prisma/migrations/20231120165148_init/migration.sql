/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `canvasImage` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `designs` table. All the data in the column will be lost.
  - Added the required column `background` to the `designs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "designs" DROP COLUMN "backgroundColor",
DROP COLUMN "canvasImage",
DROP COLUMN "thumbnail",
ADD COLUMN     "background" TEXT NOT NULL;
