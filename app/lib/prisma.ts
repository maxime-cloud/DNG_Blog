import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "~/generated/prisma/client";
// import slugExtension from 'prisma-extension-slug'

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter })
//   .$extends(
//   slugExtension([
//     {
//       model: 'category', // ← nom du modèle Prisma (en minuscule)
//       field: 'slug',
//       source: 'name',
//     },
//     {
//       model: 'article',
//       field: 'slug',
//       source: 'title',
//     },
//     {
//       model: 'series',
//       field: 'slug',
//       source: 'title',
//     },
//   ])
// );

export { prisma };