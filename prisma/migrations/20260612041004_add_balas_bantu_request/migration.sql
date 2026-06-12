-- CreateTable
CREATE TABLE "BalasBantuRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "sourceSurveyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "googleFormLink" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalasBantuRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BalasBantuRequest" ADD CONSTRAINT "BalasBantuRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalasBantuRequest" ADD CONSTRAINT "BalasBantuRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalasBantuRequest" ADD CONSTRAINT "BalasBantuRequest_sourceSurveyId_fkey" FOREIGN KEY ("sourceSurveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
