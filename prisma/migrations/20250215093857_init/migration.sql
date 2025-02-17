/*
  Warnings:

  - You are about to drop the column `emal` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "emal",
DROP COLUMN "type",
DROP COLUMN "username",
ADD COLUMN     "member_id" TEXT;
