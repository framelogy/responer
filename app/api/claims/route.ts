// Template API klaim survey.
// Dipakai saat user menandai bahwa survey sudah diisi.

import { NextResponse } from "next/server";

export async function POST() {
  // Nanti logic SQL:
  // 1. cek session user
  // 2. cek user belum pernah klaim survey ini
  // 3. tambah credits +1 dan surveysFilled +1
  // 4. simpan ke tabel SurveyClaim
  return NextResponse.json({ message: "Template endpoint klaim kredit siap disambungkan ke SQL." });
}
