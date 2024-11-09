-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "positionId" INTEGER NOT NULL,
    "positionName" TEXT NOT NULL,
    "parentId" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
