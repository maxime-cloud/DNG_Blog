/*
  Warnings:

  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'author', 'reader');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM');

-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ChangelogType" AS ENUM ('FEATURE', 'FIX', 'CONTENT', 'DESIGN', 'PERF', 'SECURITY');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'FILE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'reader';

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "seriesId" INTEGER,
    "seriesOrder" INTEGER,
    "distrosTarget" TEXT[],
    "techVersion" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "canonicalUrl" TEXT,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_categories" (
    "articleId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "article_categories_pkey" PRIMARY KEY ("articleId","categoryId")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "articleId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "sizeBytes" INTEGER,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "altText" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "userId" TEXT,
    "parentId" INTEGER,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_likes" (
    "userId" TEXT NOT NULL,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_likes_pkey" PRIMARY KEY ("userId","articleId")
);

-- CreateTable
CREATE TABLE "comment_likes" (
    "userId" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("userId","commentId")
);

-- CreateTable
CREATE TABLE "favorites" (
    "userId" TEXT NOT NULL,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("userId","articleId")
);

-- CreateTable
CREATE TABLE "reading_history" (
    "userId" TEXT NOT NULL,
    "articleId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_history_pkey" PRIMARY KEY ("userId","articleId")
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'PENDING',
    "confirmToken" TEXT,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "coverImageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_steps" (
    "id" SERIAL NOT NULL,
    "pathId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "stepTitle" TEXT,

    CONSTRAINT "learning_path_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_path_progress" (
    "userId" TEXT NOT NULL,
    "pathId" INTEGER NOT NULL,
    "stepId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_path_progress_pkey" PRIMARY KEY ("userId","pathId","stepId")
);

-- CreateTable
CREATE TABLE "article_views" (
    "id" BIGSERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_views_daily" (
    "articleId" INTEGER NOT NULL,
    "viewDate" DATE NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_views_daily_pkey" PRIMARY KEY ("articleId","viewDate")
);

-- CreateTable
CREATE TABLE "search_index" (
    "articleId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "contentPlain" TEXT NOT NULL,
    "tags" TEXT,
    "categories" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_index_pkey" PRIMARY KEY ("articleId")
);

-- CreateTable
CREATE TABLE "changelog_entries" (
    "id" SERIAL NOT NULL,
    "version" TEXT,
    "type" "ChangelogType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelog_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_publishedAt_idx" ON "articles"("publishedAt");

-- CreateIndex
CREATE INDEX "articles_authorId_idx" ON "articles"("authorId");

-- CreateIndex
CREATE INDEX "articles_seriesId_seriesOrder_idx" ON "articles"("seriesId", "seriesOrder");

-- CreateIndex
CREATE INDEX "media_articleId_idx" ON "media"("articleId");

-- CreateIndex
CREATE INDEX "comments_articleId_status_idx" ON "comments"("articleId", "status");

-- CreateIndex
CREATE INDEX "comments_parentId_idx" ON "comments"("parentId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_confirmToken_key" ON "newsletter_subscriptions"("confirmToken");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_status_idx" ON "newsletter_subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "learning_paths_slug_key" ON "learning_paths"("slug");

-- CreateIndex
CREATE INDEX "learning_path_steps_pathId_idx" ON "learning_path_steps"("pathId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_steps_pathId_stepOrder_key" ON "learning_path_steps"("pathId", "stepOrder");

-- CreateIndex
CREATE INDEX "article_views_articleId_idx" ON "article_views"("articleId");

-- CreateIndex
CREATE INDEX "article_views_viewedAt_idx" ON "article_views"("viewedAt");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_steps" ADD CONSTRAINT "learning_path_steps_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_steps" ADD CONSTRAINT "learning_path_steps_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "learning_path_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views_daily" ADD CONSTRAINT "article_views_daily_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_index" ADD CONSTRAINT "search_index_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelog_entries" ADD CONSTRAINT "changelog_entries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
