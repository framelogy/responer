// Section cara kerja platform.
// Dibuat ringkas agar user paham alur tanpa terlalu banyak teks.

import { CheckCircle2, FilePlus2, ShieldAlert, UsersRound } from "lucide-react";

const steps = [
  { icon: UsersRound, title: "Masuk anonim", text: "Gunakan Google Login, lalu publik hanya melihat username anonim." },
  { icon: CheckCircle2, title: "Bantu survei", text: "Isi survei yang sesuai dengan minatmu dan dapatkan kredit." },
  { icon: FilePlus2, title: "Upload survei", text: "Gunakan kredit komunitas untuk membagikan surveimu sendiri." },
  { icon: ShieldAlert, title: "Jaga kualitas", text: "Laporkan link rusak, spam, atau survei yang sudah tidak aktif." }
];

export function HowItWorks() {
  return (
    <section className="section" id="cara-kerja">
      <div className="section-heading centered">
        <div>
          <span className="section-label">Cara kerja</span>
          <h2>Simpel, mutualisme, dan gratis.</h2>
        </div>
      </div>
      <div className="steps-grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div className="step-card" key={step.title}>
              <span><Icon size={22} /></span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
