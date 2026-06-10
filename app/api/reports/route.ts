// Template API laporan survey.
// Dipakai untuk melaporkan link rusak, spam, atau survey yang sudah ditutup.

import { NextResponse } from "next/server";

export async function POST() {
  // Nanti logic SQL: simpan reporterId, surveyId, dan reason ke tabel Report.
  return NextResponse.json({ message: "Template endpoint report siap disambungkan ke SQL." });
}
