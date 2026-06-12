"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="header">
<Link href="/" className="brand">
  <span className="brandIcon">R</span>
  <span>Responer</span>
</Link>

      <nav className="nav">
        <Link href="/">Beranda</Link>
        <Link href="/surveys">Survei</Link>
        <Link href="/upload">Upload</Link>
        <Link href="/profile">Profil</Link>
        <Link href="/balas-bantu">Balas Bantu</Link>
      </nav>

      {session ? (
        <button className="loginBtn" onClick={() => signOut()}>
          Keluar
        </button>
      ) : (
        <button className="loginBtn" onClick={() => signIn("google")}>
          Masuk
        </button>
      )}
    </header>
  );
}