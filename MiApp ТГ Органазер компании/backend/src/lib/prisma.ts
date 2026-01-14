import { PrismaClient } from "@prisma/client";

// Единый экземпляр Prisma для всего backend
export const prisma = new PrismaClient();

