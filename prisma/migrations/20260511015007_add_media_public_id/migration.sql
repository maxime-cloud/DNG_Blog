/*
  Warnings:

  - Added the required column `colorb` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "colorb" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "publicId" TEXT;
