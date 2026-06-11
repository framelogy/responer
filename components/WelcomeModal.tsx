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

        <p>
          Pastikan login terlebih dahulu agar data survei dan kredit kamu
          tersimpan dengan aman.
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