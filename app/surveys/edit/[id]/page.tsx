"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../../components/Header";

type Survey = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  targetRespondent: string | null;
  deadline: string | null;
  googleFormLink: string;
};

export default function EditSurveyPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Umum");
  const [targetRespondent, setTargetRespondent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [googleFormLink, setGoogleFormLink] = useState("");

  useEffect(() => {
    async function fetchSurvey() {
      const res = await fetch(`/api/surveys/${id}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Survey tidak ditemukan");
        router.push("/surveys");
        return;
      }

      const survey = data as Survey;

      setTitle(survey.title || "");
      setDescription(survey.description || "");
      setCategory(survey.category || "Umum");
      setTargetRespondent(survey.targetRespondent || "");
      setGoogleFormLink(survey.googleFormLink || "");

      if (survey.deadline) {
        setDeadline(survey.deadline.slice(0, 10));
      }

      setLoading(false);
    }

    if (id) {
      fetchSurvey();
    }
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);

    const res = await fetch(`/api/surveys/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        category,
        targetRespondent,
        deadline: deadline || null,
        googleFormLink,
      }),
    });

    const data = await res.json();

    setSaving(false);

    if (!res.ok) {
      alert(data.message || "Gagal update survey");
      return;
    }

    alert(data.message || "Survey berhasil diupdate");
    router.push("/surveys");
  }

  if (loading) {
    return (
      <>
        <Header />
        <section className="pageSection">
          <div className="sectionHeader">
            <h1>Memuat data survey...</h1>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Header />

      <section className="pageSection">
        <div className="sectionHeader">
          <h1>Edit Survey</h1>
          <p>Ubah informasi survey yang sudah kamu upload.</p>
        </div>

        <form className="uploadForm" onSubmit={handleSubmit}>
          <label>
            Judul Survey
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul survey"
              required
            />
          </label>

          <label>
            Deskripsi
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi survey"
              required
            />
          </label>

          <label>
            Kategori
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
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
          </label>

          <label>
            Target Responden
            <input
              value={targetRespondent}
              onChange={(e) => setTargetRespondent(e.target.value)}
              placeholder="Contoh: Mahasiswa, pekerja, umum"
            />
          </label>

          <label>
            Deadline
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>

          <label>
            Link Google Form
            <input
              value={googleFormLink}
              onChange={(e) => setGoogleFormLink(e.target.value)}
              placeholder="https://forms.gle/..."
              required
            />
          </label>

          <div className="cardActions">
            <button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button type="button" onClick={() => router.push("/surveys")}>
              Batal
            </button>
          </div>
        </form>
      </section>
    </>
  );
}