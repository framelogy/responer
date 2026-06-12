"use client";

import { useEffect, useState } from "react";

type BalasBantuRequest = {
  id: number;
  title: string;
  googleFormLink: string;
  note: string | null;
  status: string;
  createdAt: string;
  requester: {
    name: string | null;
    email: string | null;
  };
  sourceSurvey: {
    title: string;
  };
};

function normalizeLink(link: string) {
  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }

  return `https://${link}`;
}

export default function BalasBantuInbox() {
  const [requests, setRequests] = useState<BalasBantuRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRequests() {
    const res = await fetch("/api/balas-bantu");
    const data = await res.json();

    if (res.ok) {
      setRequests(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/balas-bantu/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gagal update status");
      return;
    }

    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );

    alert(data.message || "Status berhasil diupdate");
  }

  if (loading) {
    return (
      <section className="pageSection">
        <div className="sectionHeader">
          <h2>Balas Bantu</h2>
          <p>Memuat permintaan...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pageSection">
      <div className="sectionHeader">
        <h2>Balas Bantu</h2>
        <p>Permintaan dari user yang sudah membantu survey kamu.</p>
      </div>

      {requests.length === 0 ? (
        <div className="emptyState">
          Belum ada permintaan Balas Bantu.
        </div>
      ) : (
        <div className="surveyGrid">
          {requests.map((request) => (
            <article className="surveyCard" key={request.id}>
              <span className="badge">
                {request.status === "pending"
                  ? "Menunggu"
                  : request.status === "completed"
                  ? "Selesai"
                  : "Ditolak"}
              </span>

              <h3>{request.title}</h3>

              <p>
                Dari: {request.requester.name || request.requester.email || "User"}
              </p>

              <p>
                Karena dia sudah membantu survey kamu:
                <strong> {request.sourceSurvey.title}</strong>
              </p>

              {request.note && <p>Catatan: {request.note}</p>}

              <div className="cardActions">
                <a
                  className="surveyActionLink"
                  href={normalizeLink(request.googleFormLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buka Survey
                </a>

                {request.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(request.id, "completed")}>
                      Selesai Dibantu
                    </button>

                    <button onClick={() => updateStatus(request.id, "declined")}>
                      Tolak
                    </button>
                  </>
                )}
              </div>

              {requests.length === 0 ? (
  <div className="emptyState">
    <h3>Belum ada permintaan Balas Bantu</h3>
    <p>
      Nanti kalau ada user yang sudah mengisi survei kamu dan meminta kamu
      membantu balik, permintaannya akan muncul di sini.
    </p>
  </div>
) : (
  <div className="surveyGrid">
    {/* card request */}
  </div>
)}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}