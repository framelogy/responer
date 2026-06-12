"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Survey = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  targetRespondent: string | null;
  deadline: string | null;
  googleFormLink: string;
  isClaimed?: boolean;
  isOwner?: boolean;
  reciprocityScore?: number | null;
  reciprocityBadge?: string;
};

export default function SurveySection() {
  const router = useRouter();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [claimedSurveyIds, setClaimedSurveyIds] = useState<number[]>([]);
  const [claimableSurveys, setClaimableSurveys] = useState<number[]>([]);

  const [balasBantuSurvey, setBalasBantuSurvey] = useState<Survey | null>(null);
  const [balasBantuTitle, setBalasBantuTitle] = useState("");
  const [balasBantuLink, setBalasBantuLink] = useState("");
  const [balasBantuNote, setBalasBantuNote] = useState("");
  const [sendingBalasBantu, setSendingBalasBantu] = useState(false);

  useEffect(() => {
    fetch("/api/surveys")
      .then((res) => res.json())
      .then((data: Survey[]) => {
        setSurveys(data);
        setClaimedSurveyIds(
          data.filter((survey) => survey.isClaimed).map((survey) => survey.id)
        );
      });
  }, []);

  const filtered = surveys.filter((survey) => {
    const surveyTitle = survey.title?.toLowerCase() || "";
    const surveyCategory = survey.category?.trim().toLowerCase() || "";
    const selectedCategory = category.trim().toLowerCase();

    const matchSearch = surveyTitle.includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "semua" || surveyCategory === selectedCategory;

    return matchSearch && matchCategory;
  });

  function normalizeLink(link: string) {
    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link;
    }

    return `https://${link}`;
  }

  function getSurveyStatus(deadline: string | null) {
    if (!deadline) {
      return {
        label: "Aktif",
        className: "statusActive",
      };
    }

    const today = new Date();
    const deadlineDate = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Expired",
        className: "statusExpired",
      };
    }

    if (diffDays <= 3) {
      return {
        label: `Hampir deadline · H-${diffDays}`,
        className: "statusWarning",
      };
    }

    return {
      label: "Aktif",
      className: "statusActive",
    };
  }

  function formatDeadline(deadline: string | null) {
    if (!deadline) return "Tidak ada deadline";

    return new Date(deadline).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  async function recordSurveyClick(surveyId: number) {
    try {
      await fetch("/api/surveys/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId }),
      });
    } catch (error) {
      console.error("CLICK_SURVEY_ERROR:", error);
    }

    setTimeout(() => {
      setClaimableSurveys((prev) =>
        prev.includes(surveyId) ? prev : [...prev, surveyId]
      );
    }, 60000);
  }

  async function claimSurvey(surveyId: number) {
    const res = await fetch("/api/surveys/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyId }),
    });

    const data = await res.json();

    if (res.ok) {
      setClaimedSurveyIds((prev) =>
        prev.includes(surveyId) ? prev : [...prev, surveyId]
      );
    }

    alert(data.message);
  }

  async function deleteSurvey(surveyId: number) {
    const yakin = confirm("Yakin mau hapus survei ini?");

    if (!yakin) return;

    const res = await fetch(`/api/surveys/${surveyId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gagal menghapus survei");
      return;
    }

    setSurveys((prev) => prev.filter((survey) => survey.id !== surveyId));
    alert(data.message || "Survey berhasil dihapus");
  }

  async function sendBalasBantu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!balasBantuSurvey) return;

    setSendingBalasBantu(true);

    const res = await fetch("/api/balas-bantu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceSurveyId: balasBantuSurvey.id,
        title: balasBantuTitle,
        googleFormLink: balasBantuLink,
        note: balasBantuNote,
      }),
    });

    const data = await res.json();

    setSendingBalasBantu(false);

    if (!res.ok) {
      alert(data.message || "Gagal mengirim Balas Bantu");
      return;
    }

    alert(data.message || "Permintaan Balas Bantu berhasil dikirim");

    setBalasBantuSurvey(null);
    setBalasBantuTitle("");
    setBalasBantuLink("");
    setBalasBantuNote("");
  }

  return (
    <section className="pageSection">
      <div className="sectionHeader">
        <h1>Daftar Survei</h1>
        <p>Pilih survei yang sesuai, bantu isi, lalu klaim kontribusimu.</p>
      </div>

      <div className="filterBar">
        <input
          placeholder="Cari judul survei..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Semua">Semua</option>
          <option value="Teknologi">Teknologi</option>
          <option value="Akademik">Akademik</option>
          <option value="Penelitian">Penelitian</option>
          <option value="Bisnis">Bisnis</option>
          <option value="Kesehatan">Kesehatan</option>
          <option value="Sosial">Sosial</option>
          <option value="Lifestyle">Lifestyle</option>
          <option value="Umum">Umum</option>
          <option value="Platform">Platform</option>
        </select>
      </div>

      <div className="surveyGrid">
        {filtered.map((survey) => {
          const status = getSurveyStatus(survey.deadline);

          return (
            <article
              className={`surveyCard ${
                claimedSurveyIds.includes(survey.id) ? "surveyCardClaimed" : ""
              }`}
              key={survey.id}
            >
              <div className="surveyTopRow">
                <span className="badge">
                  {survey.category || "Tanpa Kategori"}
                </span>

                <span className={`surveyStatus ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <p className="reciprocityNote">
                Reputasi Balas Bantu:{" "}
                <strong>
                  {survey.reciprocityScore === null ||
                  survey.reciprocityScore === undefined
                    ? "Baru"
                    : `${survey.reciprocityScore}% · ${survey.reciprocityBadge}`}
                </strong>
              </p>

              <h3>{survey.title}</h3>

              <p>{survey.description || "Tidak ada deskripsi."}</p>

              <div className="surveyMeta">
                <div>
                  <span>Kriteria Responden</span>
                  <strong>
                    {survey.targetRespondent || "Tidak dicantumkan"}
                  </strong>
                </div>

                <div>
                  <span>Deadline</span>
                  <strong>{formatDeadline(survey.deadline)}</strong>
                </div>
              </div>

              <div className="cardActions">
                <a
                  className="surveyActionLink"
                  href={normalizeLink(survey.googleFormLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordSurveyClick(survey.id)}
                >
                  Buka Survei
                </a>

                <button
                  disabled={
                    claimedSurveyIds.includes(survey.id) ||
                    !claimableSurveys.includes(survey.id)
                  }
                  onClick={() => claimSurvey(survey.id)}
                >
                  {claimedSurveyIds.includes(survey.id)
                    ? "Sudah Diisi"
                    : "Sudah Mengisi"}
                </button>

                {survey.isOwner && (
                  <>
                    <button
                      onClick={() => router.push(`/surveys/edit/${survey.id}`)}
                    >
                      Edit
                    </button>

                    <button onClick={() => deleteSurvey(survey.id)}>
                      Delete
                    </button>
                  </>
                )}

                {!survey.isOwner && claimedSurveyIds.includes(survey.id) && (
                  <button onClick={() => setBalasBantuSurvey(survey)}>
                    Minta Balas Bantu
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {balasBantuSurvey && (
        <div className="balasBantuOverlay">
          <form className="balasBantuModal" onSubmit={sendBalasBantu}>
            <h2>Minta Balas Bantu</h2>

            <p>
              Kamu sudah membantu survey:
              <strong> {balasBantuSurvey.title}</strong>
            </p>

            <label>
              Judul Survey Kamu
              <input
                value={balasBantuTitle}
                onChange={(e) => setBalasBantuTitle(e.target.value)}
                placeholder="Contoh: Survey Pengembangan Aplikasi Mahasiswa"
                required
              />
            </label>

            <label>
              Link Survey Kamu
              <input
                value={balasBantuLink}
                onChange={(e) => setBalasBantuLink(e.target.value)}
                placeholder="https://forms.gle/..."
                required
              />
            </label>

            <label>
              Catatan Opsional
              <textarea
                value={balasBantuNote}
                onChange={(e) => setBalasBantuNote(e.target.value)}
                placeholder="Contoh: Tolong isi kalau kamu mahasiswa aktif yaa"
              />
            </label>

            <div className="cardActions">
              <button type="submit" disabled={sendingBalasBantu}>
                {sendingBalasBantu ? "Mengirim..." : "Kirim Permintaan"}
              </button>

              <button type="button" onClick={() => setBalasBantuSurvey(null)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}