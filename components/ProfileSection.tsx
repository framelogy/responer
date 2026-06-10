"use client";

import { useEffect, useState } from "react";

type Me = {
  username: string;
  avatarUrl: string | null;
  credit: number;
  surveysFilled: number;
  surveysPosted: number;
};

export default function ProfileSection() {
  const [me, setMe] = useState<Me | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        setUsername(data.username || "");
        setAvatarUrl(data.avatarUrl || "");
      });
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/me/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, avatarUrl }),
    });

    const data = await res.json();
    setMe(data);
    alert("Profil berhasil diperbarui");
  }

async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (data.secure_url) {
    setAvatarUrl(data.secure_url);
  } else {
    alert("Upload foto gagal");
  }
}

  if (!me) {
    return (
      <section className="pageSection">
        <h1>Profil</h1>
        <p>Silakan login terlebih dahulu.</p>
      </section>
    );
  }

  return (
    <section className="pageSection">
      <div className="sectionHeader">
        <h1>Profil</h1>
        <p>Atur identitas dan data kontribusi kamu.</p>
      </div>

      <form className="uploadForm" onSubmit={handleUpdate}>
        <div className="avatarFallback">
  {avatarUrl ? (
    <img src={avatarUrl} alt="Avatar" />
  ) : (
    <span>{username?.charAt(0)?.toUpperCase() || "R"}</span>
  )}
</div>

        <div className="formGroup">
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@ResponerUser"
          />
        </div>

<div className="formGroup">
  <label>Foto Profil</label>
  <input type="file" accept="image/*" onChange={handleAvatarUpload} />
</div>

        <button className="primaryBtn" type="submit">
          Simpan Profil
        </button>
      </form>

      <div className="profileGrid">
        <div className="profileCard">
          <span>Kredit</span>
          <strong>{me.credit}</strong>
        </div>
        <div className="profileCard">
          <span>Survei Diisi</span>
          <strong>{me.surveysFilled}</strong>
        </div>
        <div className="profileCard">
          <span>Survei Diposting</span>
          <strong>{me.surveysPosted}</strong>
        </div>
      </div>
    </section>
  );
}