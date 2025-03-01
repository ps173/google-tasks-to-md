-- CreateTable
CREATE TABLE "Credential" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "refresh_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "accessTokenExpiry" DATETIME NOT NULL,
    "refreshTokenExpiry" DATETIME NOT NULL
);
