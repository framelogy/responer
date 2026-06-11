"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Survey = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  targetRespondent: string | null;
  googleFormLink: string;
  isClaimed?: boolean;
  isOwner?: boolean;
};

export default function SurveySection() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [claimedSurveyIds, setClaimedSurveyIds] = useState<number[]>([]);
  const [claimableSurveys, setClaimableSurveys] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/surveys")
      .then((res) => res.json())
      .then((data: Survey[]) => {
        setSurveys(data);
        setClaimedSurveyIds(
          data
            .filter((survey) => survey.isClaimed)
            .map((survey) => survey.id)
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

  async function openSurvey(survey: Survey) {
    await fetch("/api/surveys/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyId: survey.id }),
    });

    window.open(survey.googleFormLink, "_blank");

    setTimeout(() => {
      setClaimableSurveys((prev) =>
        prev.includes(survey.id) ? prev : [...prev, survey.id]
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
        {filtered.map((survey) => (
          <article
            className={`surveyCard ${
              claimedSurveyIds.includes(survey.id) ? "surveyCardClaimed" : ""
            }`}
            key={survey.id}
          >
            <span className="badge">
              {survey.category || "Tanpa Kategori"}
            </span>

            <h3>{survey.title}</h3>
            <p>{survey.description}</p>
            <small>{survey.targetRespondent}</small>

            <div className="cardActions">
              <button onClick={() => openSurvey(survey)}>Buka Survei</button>

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
      <button onClick={() => router.push(`/surveys/edit/${survey.id}`)}>
        Edit
      </button>

      <button onClick={() => deleteSurvey(survey.id)}>
        Delete
      </button>
    </>
  )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}