import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function initializeDb() {
  await prisma.$connect();
}

export async function saveCredentials(
  refreshToken: string,
  accessToken: string,
  accessTokenExpiry: number,
  refreshTokenExpiry: number
) {
  const currentTime = new Date();
  await prisma.credential.create({
    data: {
      refresh_token: refreshToken,
      access_token: accessToken,
      accessTokenExpiry: new Date(
        currentTime.getTime() + accessTokenExpiry * 1000
      ),
      refreshTokenExpiry: new Date(
        currentTime.getTime() + refreshTokenExpiry * 1000
      ),
    },
  });
}

export async function getCredentials() {
  return prisma.credential.findFirst({
    orderBy: {
      id: "desc",
    },
  });
}

export async function updateCredentials(
  id: number,
  refreshToken: string,
  accessToken: string,
  accessTokenExpiry: number,
  refreshTokenExpiry: number
) {
  const currentTime = new Date();
  await prisma.credential.update({
    where: { id },
    data: {
      refresh_token: refreshToken,
      access_token: accessToken,
      accessTokenExpiry: new Date(
        currentTime.getTime() + accessTokenExpiry * 1000
      ),
      refreshTokenExpiry: new Date(
        currentTime.getTime() + refreshTokenExpiry * 1000
      ),
    },
  });
}

export async function deleteCredentials(id: number) {
  await prisma.credential.delete({
    where: { id },
  });
}
