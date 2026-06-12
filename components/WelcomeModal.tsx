"use client";

import { useEffect, useState } from "react";

export default function WelcomeModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("responer-welcome-seen");

    if (!hasSeenWelcome) {
      setTimeout(() => {
        setShow(true);
      }, 400);
    }
  }, []);

  function closeWelcome() {
    localStorage.setItem("responer-welcome-seen", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="welcomeOverlay">
      <div className="welcomeModal">
        <div className="welcomeIcon">R</div>

        <h1>Welcome to Responer</h1>

        <p>
          Kamu perlu mendapatkan <strong>3 kredit</strong> untuk upload 1 survei.
          Kredit bisa didapatkan dengan mengisi survei orang lain.
        </p>

        <div className="welcomeNotice">
          <strong>Balas Bantu</strong>
          <span>
            Jangan lupa aktif membantu permintaan Balas Bantu. Semakin rajin
            kamu membalas bantuan, persentase badge kamu bisa naik dan surveimu
            berpeluang mendapat prioritas lebih baik di beranda.
          </span>
        </div>

        <p>
          Pastikan login terlebih dahulu agar data survei, kredit, dan progres
          Balas Bantu kamu tersimpan dengan aman.
        </p>

        <p>
          Hubungan mutualisme adalah hal terbaik bagi kita semua :3
        </p>

        <button onClick={closeWelcome}>
          Saya Mengerti
        </button>
      </div>
    </div>
  );
}