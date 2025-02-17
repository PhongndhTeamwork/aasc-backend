/*
  Warnings:

  - You are about to drop the `banks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requitises` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "banks" DROP CONSTRAINT "banks_userId_fkey";

-- DropForeignKey
ALTER TABLE "requitises" DROP CONSTRAINT "requitises_userId_fkey";

-- DropTable
DROP TABLE "banks";

-- DropTable
DROP TABLE "requitises";
