import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getUrl = () => {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }

  const hostname = url.split('@')[1].split('/')[0].split('.')[0];

  const newHostname = hostname.concat('-pooler');

  const newUrl = url.replace(hostname, newHostname);

  // when using a pooled database connection with prisma, you need to append`?pgbouncer=true` to the connection string.
  // The reason this is done here rather than in the .env file is because the Neon Vercel integration doesn't include it.
  newUrl.concat('?pgbouncer=true&connect_timeout=10&pool_timeout=10');

  return newUrl;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
