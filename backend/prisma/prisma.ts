import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaBetterSqlite3({ url: env["DATABASE_URL"]! });

export const prismaClient = globalForPrisma.prisma || new PrismaClient({ adapter });

globalForPrisma.prisma = prismaClient;