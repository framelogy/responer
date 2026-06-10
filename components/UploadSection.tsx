"use client";

import { useState } from "react";

export default function UploadSection() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    targetRespondent: "",
    deadline: "",
    googleFormLink: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const res = await fetch("/api/surveys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    alert(data.message || "Upload survey gagal");
    return;
  }

  alert(data.message || "Survey berhasil diupload");
}

  return (
    <section className="pageSection">
      <div className="sectionHeader">
        <h1>Upload Survey</h1>
        <p>Tambahkan link Google Form agar responden lain bisa membantu mengisi.</p>
      </div>

      <form className="uploadForm" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label>Judul Survey</label>
          <input name="title" onChange={handleChange} required />
        </div>

        <div className="formGroup">
          <label>Deskripsi</label>
          <textarea name="description" onChange={handleChange} required />
        </div>

        <div className="formRow">
          <div className="formGroup">
            <label>Kategori</label>
            <select name="category" value={form.category} onChange={handleChange} required>
<option value="Teknologi">Teknologi</option>
<option value="Akademik">Akademik</option>
<option value="Skripsi">Skripsi</option>
<option value="Penelitian">Penelitian</option>
<option value="Bisnis">Bisnis</option>
<option value="Kesehatan">Kesehatan</option>
<option value="Psikologi">Psikologi</option>
<option value="Pendidikan">Pendidikan</option>
<option value="Sosial">Sosial</option>
<option value="Lifestyle">Lifestyle</option>
<option value="Umum">Umum</option>
<option value="Platform">Platform</option>
            </select>
          </div>

          <div className="formGroup">
            <label>Deadline</label>
            <input type="date" name="deadline" onChange={handleChange} />
          </div>
        </div>

        <div className="formGroup">
          <label>Target Responden</label>
          <input name="targetRespondent" onChange={handleChange} required />
        </div>

        <div className="formGroup">
          <label>Link Google Form</label>
          <input name="googleFormLink" onChange={handleChange} required />
        </div>

        <button className="primaryBtn" type="submit">
          Upload Survey
        </button>
      </form>
    </section>
  );
}