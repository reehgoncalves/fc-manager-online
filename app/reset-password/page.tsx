"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setEmail(query.get("email") ?? "");
    setToken(query.get("token") ?? "");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ email, token, password: form.get("password"), password_confirmation: form.get("password_confirmation") }) });
    const payload = await response.json().catch(() => ({}));
    setNotice(response.ok ? payload.message : Object.values(payload.errors ?? {}).flat().join(" ") || payload.message || "Não foi possível redefinir a senha.");
    setBusy(false);
  }

  return <main className="auth-page"><section className="auth-panel auth-panel-centered"><div className="auth-card"><span className="auth-kicker">RECUPERAR ACESSO</span><h1>Crie uma nova senha</h1><p className="auth-lead">Use um mínimo de 8 caracteres, com maiúscula, minúscula e número.</p><form className="auth-form" onSubmit={submit}><label>E-mail<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label><label>Nova senha<input name="password" minLength={8} type="password" required /></label><label>Confirme a senha<input name="password_confirmation" minLength={8} type="password" required /></label>{notice && <div className="auth-notice">✓ {notice}</div>}<button className="auth-submit" disabled={busy || !token} type="submit">{busy ? "Salvando..." : "Redefinir senha"}<span>→</span></button></form><div className="auth-switch"><span>Já tem acesso?</span><Link href="/login">Voltar ao login</Link></div></div></section></main>;
}
