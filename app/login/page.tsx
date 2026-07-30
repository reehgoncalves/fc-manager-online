"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "register") setMode("register");
    if (window.localStorage.getItem("fc-manager-logout-notice")) {
      setNotice(window.localStorage.getItem("fc-manager-logout-notice") || "Você saiu da sua conta com segurança.");
      window.localStorage.removeItem("fc-manager-logout-notice");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    if (mode === "forgot") {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: formData.get("email") }) });
      const payload = await response.json().catch(() => ({}));
      setNotice(payload.message || "Se o e-mail estiver cadastrado, enviaremos um link seguro para redefinir sua senha.");
      setBusy(false);
      return;
    }
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "Bruno Mendes").trim() || "Bruno Mendes";
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const response = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(mode === "register" ? { name, email, password, password_confirmation: String(formData.get("password_confirmation") || "") } : { email, password, device_name: "web" }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errors = payload.errors ? Object.values(payload.errors).flat().join(" ") : "Não foi possível concluir o acesso. Tente novamente.";
      setNotice(errors);
      setBusy(false);
      return;
    }
    setNotice(mode === "register" ? "Conta criada. Preparando sua carreira..." : "Login confirmado. Bem-vindo de volta.");
    window.setTimeout(() => router.push("/career"), 450);
  }

  return (
    <main className="auth-page">
      <div className="auth-art"><div className="auth-art-overlay" /><div className="auth-brand"><span className="brand-mark">FC</span><span>FC <b>MANAGER</b></span><i>ONLINE</i></div><div className="auth-art-copy"><span className="eyebrow">A PRÓXIMA GRANDE HISTÓRIA COMEÇA AGORA</span><h1>Monte seu time.<br /><em>Viva a carreira.</em></h1><p>Escolha seu clube, enfrente managers do mundo todo e transforme cada decisão em um momento inesquecível.</p><div className="auth-art-stats"><span><strong>18.4k</strong><small>managers online</small></span><span><strong>07</strong><small>temporada atual</small></span><span><strong>∞</strong><small>possibilidades</small></span></div></div><div className="auth-quote"><span>“</span><p>O jogo muda a cada rodada.<br />A sua história também.</p></div></div>
      <section className="auth-panel">
        <div className="auth-panel-top"><span className="auth-mobile-brand"><span className="brand-mark">FC</span> FC MANAGER</span><span>PT-BR <b>⌄</b></span></div>
        <div className="auth-card">
          {mode === "forgot" ? <><span className="auth-kicker">RECUPERAR ACESSO</span><h2>Esqueceu sua senha?</h2><p className="auth-lead">Digite seu e-mail e enviaremos um link para você voltar à sua carreira.</p></> : <><span className="auth-kicker">{mode === "register" ? "NOVA CONTA · TEMPORADA 07" : "BEM-VINDO DE VOLTA"}</span><h2>{mode === "register" ? "Crie sua carreira" : "Entre no jogo"}</h2><p className="auth-lead">{mode === "register" ? "Comece sua jornada como manager hoje." : "Sua próxima decisão já está esperando."}</p></>}
          {mode !== "forgot" && <div className="social-login"><button className="social-button google" onClick={() => setNotice("Google OAuth ainda depende das credenciais e callback do provedor.")} type="button"><span>G</span> Continuar com Google</button><button className="social-button facebook" onClick={() => setNotice("Facebook OAuth ainda depende das credenciais e callback do provedor.")} type="button"><span>f</span> Continuar com Facebook</button></div>}
          {mode !== "forgot" && <div className="auth-divider"><span>ou continue com e-mail</span></div>}
          <form className="auth-form" onSubmit={submit}>{mode === "register" && <label>Como quer ser chamado<input name="name" placeholder="Nome do manager" required /></label>}<label>E-mail<input name="email" type="email" placeholder="voce@email.com" required /></label>{mode !== "forgot" && <label>Senha<div className="password-input"><input name="password" type={showPassword ? "text" : "password"} placeholder="Mínimo de 8 caracteres" minLength={8} required /><button aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? "◉" : "◌"}</button></div></label>}{mode === "register" && <label>Confirme sua senha<input name="password_confirmation" type="password" placeholder="Repita sua senha" minLength={8} required /></label>}{mode === "login" && <div className="auth-options"><label className="remember"><input type="checkbox" /> <span>Lembrar de mim</span></label><button onClick={() => setMode("forgot")} type="button">Esqueci minha senha</button></div>}{notice && <div className="auth-notice">✓ {notice}</div>}<button className="auth-submit" disabled={busy} type="submit">{busy ? "Processando..." : mode === "register" ? "Criar minha conta" : mode === "forgot" ? "Enviar link de recuperação" : "Entrar na minha carreira"}<span>→</span></button></form>
          <div className="auth-switch">{mode === "forgot" ? <><span>Lembrou da senha?</span><button onClick={() => setMode("login")} type="button">Voltar para o login</button></> : <><span>{mode === "register" ? "Já tem uma conta?" : "Ainda não tem uma conta?"}</span><button onClick={() => setMode(mode === "register" ? "login" : "register")} type="button">{mode === "register" ? "Entrar agora" : "Criar conta grátis"}</button></>}</div>
          <div className="auth-terms">Ao continuar, você concorda com os <a href="#terms">Termos de uso</a> e a <a href="#privacy">Política de privacidade</a>.</div>
        </div>
        <div className="auth-panel-footer"><Link href="/">Acessar painel demo</Link><span>© 2025 FC Manager Online</span></div>
      </section>
    </main>
  );
}
