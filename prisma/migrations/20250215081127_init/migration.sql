-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "username" TEXT NOT NULL,
    "emal" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
