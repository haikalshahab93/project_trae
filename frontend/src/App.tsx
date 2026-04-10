import { useEffect, useState } from "react";
import "./App.css";
import Learning from "./Learning";

type StudentUser = {
  id: string;
  username: string;
  name: string;
  grade: string;
};

type UserSummary = {
  user: StudentUser;
  scores: Array<{
    id: string;
    grade: string;
    topic: string;
    mode: "practice" | "exam";
    score: number;
    correct: number;
    total: number;
    createdAt: number;
  }>;
  stats: {
    attemptCount: number;
    examCount: number;
    bestScore: number;
    averageScore: number;
  };
};

function App() {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem("belajarhitung_admin_token") || "");
  const [userToken, setUserToken] = useState<string>(() => localStorage.getItem("belajarhitung_user_token") || "");
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [userAuthMode, setUserAuthMode] = useState<"login" | "register">("login");
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userForm, setUserForm] = useState({ name: "", username: "", password: "", grade: "Kelas 1" });
  const [selectedGrade, setSelectedGrade] = useState("Kelas 1");
  const classes = [
    { grade: "Kelas 1", focus: "Mengenal angka, penjumlahan, dan pengurangan sederhana.", tag: "Dasar angka" },
    { grade: "Kelas 2", focus: "Operasi dua digit, pola hitung, dan perkalian dasar.", tag: "Latihan cepat" },
    { grade: "Kelas 3", focus: "Pembagian dasar, nilai tempat, dan soal cerita singkat.", tag: "Logika hitung" },
    { grade: "Kelas 4", focus: "Pecahan, keliling bangun datar, dan hitung campuran.", tag: "Materi menengah" },
    { grade: "Kelas 5", focus: "Desimal, skala, volume, serta KPK dan FPB.", tag: "Siap tantangan" },
    { grade: "Kelas 6", focus: "Persen, perbandingan, dan latihan persiapan ujian.", tag: "Fokus ujian" },
  ];
  const trustHighlights = [
    { value: "6", label: "Jenjang kelas siap dipakai" },
    { value: "Latihan + Ujian", label: "Mode belajar lebih variatif" },
    { value: "Leaderboard", label: "Motivasi siswa per kelas" },
  ];
  const learningSteps = [
    {
      title: "Buat akun siswa",
      description: "Siswa login sekali, lalu seluruh nilai latihan dan ujian langsung tercatat otomatis.",
    },
    {
      title: "Pilih kelas dan topik",
      description: "Materi dibagi sesuai kelas supaya anak belajar bertahap dan tidak merasa kewalahan.",
    },
    {
      title: "Pantau perkembangan",
      description: "Gunakan rekap nilai, progres, dan leaderboard untuk melihat hasil belajar dengan cepat.",
    },
  ];
  const testimonials = [
    {
      name: "Orang Tua",
      quote: "Tampilannya lebih rapi, jadi anak lebih semangat membuka latihan setiap hari.",
    },
    {
      name: "Guru Kelas",
      quote: "Leaderboard per kelas membantu memotivasi siswa tanpa membuat proses belajar terasa berat.",
    },
    {
      name: "Siswa",
      quote: "Soalnya enak dilihat dan aku suka karena bisa lihat nilai terbaikku sendiri.",
    },
  ];

  useEffect(() => {
    if (!userToken) {
      setUserSummary(null);
      return;
    }
    fetch(`${apiBaseUrl}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Gagal memuat akun siswa.");
        return data as UserSummary;
      })
      .then((data) => {
        setUserSummary(data);
        setUserForm((prev) => ({ ...prev, grade: data.user.grade }));
      })
      .catch((error: Error) => {
        localStorage.removeItem("belajarhitung_user_token");
        setUserToken("");
        setUserSummary(null);
        setUserError(error.message || "Sesi siswa berakhir.");
      });
  }, [apiBaseUrl, userToken]);

  async function doLogin() {
    setLoading(true);
    const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("belajarhitung_admin_token", data.token);
      setAuthToken(data.token);
      setShowLogin(false);
    }
    setLoading(false);
  }

  async function submitUserAuth() {
    setUserLoading(true);
    setUserError("");
    const endpoint = userAuthMode === "register" ? "/api/users/register" : "/api/users/login";
    const payload =
      userAuthMode === "register"
        ? userForm
        : {
            username: userForm.username,
            password: userForm.password,
          };
    try {
      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setUserError(data?.error || "Login siswa gagal.");
        return;
      }
      localStorage.setItem("belajarhitung_user_token", data.token);
      setUserToken(data.token);
      setUserForm((prev) => ({ ...prev, password: "" }));
      if (data.user?.grade) {
        setSelectedGrade(data.user.grade);
      }
    } catch {
      setUserError("Koneksi ke backend gagal.");
    } finally {
      setUserLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("belajarhitung_admin_token");
    setAuthToken("");
  }

  function logoutUser() {
    localStorage.removeItem("belajarhitung_user_token");
    setUserToken("");
    setUserSummary(null);
  }

  return (
    <div className="page">
      <header className="header">
        <div className="container header-inner">
          <div className="brand">Kelas Hitung Ceria</div>
          <nav className="nav">
            <a href="#beranda">Beranda</a>
            <a href="#kelas">Kelas</a>
            <a href="#akun">Akun</a>
            <a href="#belajar">Belajar</a>
            {authToken && <a href="#admin">Admin</a>}
          </nav>
        </div>
      </header>
      <main>
        <section id="beranda" className="hero hero-math">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-inner">
            <div className="hero-layout">
              <div>
                <div className="brandline">
                  <span className="badge">Belajar Matematika</span>
                  <span>Untuk Anak SD</span>
                </div>
                <h1>Belajar hitung yang rapi, seru, dan mudah dipantau per kelas.</h1>
                <p>
                  Anak bisa belajar sesuai kelas, mengerjakan latihan dan ujian, lalu orang tua atau guru dapat melihat
                  rekap nilai dan leaderboard kelas dengan tampilan yang lebih menarik.
                </p>
                <div className="cta">
                  <a className="btn primary" href="#belajar">
                    Mulai Belajar
                  </a>
                  <a className="btn outline" href="#akun">
                    Login Siswa
                  </a>
                </div>
                <div className="hero-points">
                  <div className="hero-point">Kelas 1 sampai Kelas 6</div>
                  <div className="hero-point">Mode latihan interaktif</div>
                  <div className="hero-point">Rekap nilai dan leaderboard kelas</div>
                </div>
              </div>
              <div className="hero-panel">
                <div className="hero-panel-card">
                  <div className="small">Ringkasan Platform</div>
                  <div className="hero-stat-grid">
                    <div className="hero-stat">
                      <div className="hero-stat-value">6</div>
                      <div className="small">Jenjang kelas</div>
                    </div>
                    <div className="hero-stat">
                      <div className="hero-stat-value">{userSummary?.stats.attemptCount || 0}</div>
                      <div className="small">Percobaan siswa</div>
                    </div>
                    <div className="hero-stat">
                      <div className="hero-stat-value">{userSummary?.stats.bestScore || 0}</div>
                      <div className="small">Nilai terbaik</div>
                    </div>
                    <div className="hero-stat">
                      <div className="hero-stat-value">{userSummary ? userSummary.user.grade.replace("Kelas ", "") : "-"}</div>
                      <div className="small">Kelas aktif</div>
                    </div>
                  </div>
                </div>
                <div className="hero-checklist">
                  <div className="hero-check">Tampilan lebih profesional untuk promosi</div>
                  <div className="hero-check">Akun siswa tersimpan dan aman</div>
                  <div className="hero-check">Siap dibuild untuk GitHub Pages</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section section-soft">
          <div className="container">
            <div className="trust-strip">
              {trustHighlights.map((item) => (
                <div key={item.label} className="trust-card">
                  <div className="trust-value">{item.value}</div>
                  <div className="card-sub">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="section-heading">
              <div>
                <span className="badge">Keunggulan</span>
                <h2>Lebih menarik untuk siswa, orang tua, dan guru</h2>
              </div>
              <p className="learning-lead">
                Tampilan dibikin lebih rapi supaya lebih meyakinkan saat dibagikan, dipromosikan, atau dipakai belajar rutin.
              </p>
            </div>
            <div className="cards feature-cards">
              <div className="card feature-card">
                <div className="feature-icon">🎯</div>
                <div className="card-title">Target belajar jelas</div>
                <div className="card-sub">Anak langsung fokus ke kelas dan topik yang sesuai kebutuhannya.</div>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">📊</div>
                <div className="card-title">Rekap nilai otomatis</div>
                <div className="card-sub">Semua hasil latihan dan ujian tersimpan agar perkembangan mudah dipantau.</div>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">🏆</div>
                <div className="card-title">Leaderboard per kelas</div>
                <div className="card-sub">Siswa termotivasi karena bisa melihat peringkat terbaik di kelasnya.</div>
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="badge">Cara Kerja</span>
                <h2>Alur belajar yang sederhana dan meyakinkan</h2>
              </div>
              <p className="learning-lead">
                Pengalaman dibuat sesederhana mungkin supaya siswa cepat mulai, orang tua cepat paham, dan guru mudah
                memantau hasilnya.
              </p>
            </div>
            <div className="cards process-cards">
              {learningSteps.map((item, index) => (
                <div key={item.title} className="card process-card">
                  <div className="process-number">0{index + 1}</div>
                  <div className="card-title">{item.title}</div>
                  <div className="card-sub">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="kelas" className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="badge">Kurikulum</span>
                <h2>Pilih Jalur Belajar Sesuai Kelas</h2>
              </div>
              <p className="learning-lead">
                Materi disusun bertahap supaya anak tidak bingung dan bisa fokus pada target kelasnya masing-masing.
              </p>
            </div>
            <div className="cards">
              {classes.map((item) => (
                <div key={item.grade} className={`card class-card ${selectedGrade === item.grade ? "selected" : ""}`}>
                  <div className="class-card-head">
                    <div className="card-title">{item.grade}</div>
                    <div className="class-tag">{item.tag}</div>
                  </div>
                  <div className="card-sub">{item.focus}</div>
                  <div className="class-card-meta">
                    <span className="class-meta-pill">Materi bertahap</span>
                    <span className="class-meta-pill">{selectedGrade === item.grade ? "Sedang dipilih" : "Siap dipelajari"}</span>
                  </div>
                  <div className="actions">
                    <a
                      className={`btn ${selectedGrade === item.grade ? "primary" : "outline"}`}
                      href="#belajar"
                      onClick={() => setSelectedGrade(item.grade)}
                    >
                      Belajar {item.grade}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="akun" className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="badge">Akun Siswa</span>
                <h2>Login dan Register Siswa</h2>
              </div>
              <p className="learning-lead">
                Siswa perlu login sebelum mengerjakan soal supaya nilai latihan dan ujian bisa direkap otomatis.
              </p>
            </div>
            <div className="cards auth-cards">
              <div className="card auth-card-main">
                <div className="links">
                  <button
                    className={`btn ${userAuthMode === "login" ? "primary" : "outline"}`}
                    onClick={() => setUserAuthMode("login")}
                  >
                    Login
                  </button>
                  <button
                    className={`btn ${userAuthMode === "register" ? "primary" : "outline"}`}
                    onClick={() => setUserAuthMode("register")}
                  >
                    Register
                  </button>
                </div>
                <div className="grid">
                  {userAuthMode === "register" && (
                    <label>
                      <span>Nama Siswa</span>
                      <input
                        value={userForm.name}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Contoh: Nabila"
                      />
                    </label>
                  )}
                  <label>
                    <span>Username</span>
                    <input
                      value={userForm.username}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="username siswa"
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="password"
                    />
                  </label>
                  {userAuthMode === "register" && (
                    <label>
                      <span>Kelas</span>
                      <select
                        value={userForm.grade}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, grade: e.target.value }))}
                      >
                        {classes.map((item) => (
                          <option key={item.grade} value={item.grade}>
                            {item.grade}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                {userError && <div className="learning-status">{userError}</div>}
                <div className="actions">
                  <button className="btn primary" onClick={submitUserAuth} disabled={userLoading}>
                    {userLoading ? "Memproses..." : userAuthMode === "register" ? "Buat Akun Siswa" : "Masuk Sebagai Siswa"}
                  </button>
                </div>
                <div className="auth-note">
                  {apiBaseUrl.includes("localhost")
                    ? "Mode lokal aktif. Untuk GitHub Pages, ubah VITE_API_BASE_URL ke URL backend publik."
                    : `Backend aktif di ${apiBaseUrl}`}
                </div>
              </div>
              <div className="card auth-card-side">
                <div className="card-title">{userSummary ? userSummary.user.name : "Belum ada siswa login"}</div>
                <div className="card-sub">
                  {userSummary
                    ? `@${userSummary.user.username} • ${userSummary.user.grade}`
                    : "Setelah login, rekap nilai terbaru akan muncul di sini."}
                </div>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="small">Total Percobaan</div>
                    <div className="card-title">{userSummary?.stats.attemptCount || 0}</div>
                  </div>
                  <div className="info-card">
                    <div className="small">Ujian</div>
                    <div className="card-title">{userSummary?.stats.examCount || 0}</div>
                  </div>
                  <div className="info-card">
                    <div className="small">Nilai Terbaik</div>
                    <div className="card-title">{userSummary?.stats.bestScore || 0}</div>
                  </div>
                </div>
                {userSummary && (
                  <>
                    <div className="small">Riwayat terbaru</div>
                    <div className="history-grid">
                      {userSummary.scores.slice(0, 4).map((item) => (
                        <div key={item.id} className="history-card">
                          <div className="small">{item.mode === "exam" ? "Ujian" : "Latihan"}</div>
                          <div className="card-title">{item.score}</div>
                          <div className="card-sub">
                            {item.grade} • {item.correct}/{item.total} benar
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="actions">
                      <button className="btn outline" onClick={logoutUser}>
                        Logout Siswa
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="section section-soft">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="badge">Kesan Pengguna</span>
                <h2>Tampilan yang lebih rapi membuat belajar terasa lebih dipercaya</h2>
              </div>
              <p className="learning-lead">
                Cocok untuk ditunjukkan ke calon pengguna karena tampilannya terasa lebih profesional namun tetap ramah
                untuk anak.
              </p>
            </div>
            <div className="testimonials">
              {testimonials.map((item) => (
                <div key={item.name} className="testimonial premium-testimonial">
                  <div className="stars">★★★★★</div>
                  <div className="card-sub">“{item.quote}”</div>
                  <div className="card-title testimonial-name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="promo-banner">
              <div>
                <span className="badge">Siap Dipakai</span>
                <h2>Mulai dari akun siswa, lanjut ke latihan, lalu lihat hasilnya di leaderboard.</h2>
                <p className="learning-lead">
                  Semua bagian utama sudah terhubung, jadi halaman ini sekarang lebih siap dipakai untuk demo, promosi,
                  atau penggunaan belajar harian.
                </p>
              </div>
              <div className="promo-actions">
                <a className="btn primary" href="#akun">
                  Buat Akun Siswa
                </a>
                <a className="btn outline" href="#belajar">
                  Lihat Area Belajar
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="belajar" className="section">
          <Learning
            apiBaseUrl={apiBaseUrl}
            authToken={authToken}
            userToken={userToken}
            user={userSummary?.user || null}
            initialGrade={selectedGrade}
            onRequireLogin={() => setShowLogin(true)}
            onRequireUserLogin={() => window.location.assign("#akun")}
            onUserLogout={logoutUser}
          />
        </section>
        {authToken && (
          <section id="admin" className="section">
            <div className="container">
              <h2>Kontrol Admin</h2>
              <div className="info-grid">
                <div className="info-card">
                  <div className="card-title">Status</div>
                  <div className="card-sub">Admin sudah login dan bisa mengubah bank soal.</div>
                </div>
                <div className="info-card">
                  <div className="card-title">Yang Bisa Diubah</div>
                  <div className="card-sub">Kelas, topik, tingkat kesulitan, soal, jawaban, petunjuk, dan pembahasan.</div>
                </div>
                <div className="info-card">
                  <div className="card-title">Akses</div>
                  <div className="links">
                    <button className="btn success" onClick={logout} disabled={loading}>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      {showLogin && (
        <div className="modal">
          <div className="modal-content">
            <h3>Login Admin</h3>
            <div className="grid">
              <label>
                <span>Username</span>
                <input value={loginForm.username} onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))} />
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} />
              </label>
            </div>
            <div className="actions">
              <button className="btn primary" onClick={doLogin} disabled={loading}>Masuk</button>
              <button className="btn" onClick={() => setShowLogin(false)} disabled={loading}>Batal</button>
            </div>
          </div>
        </div>
      )}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand-block">
            <div className="footer-brand-title">Kelas Hitung Ceria</div>
            <div className="small">Platform belajar matematika anak dengan akun siswa, rekap nilai, dan leaderboard kelas.</div>
          </div>
          <div className="footer-actions">
            <div className="footer-badges">
              <span className="footer-badge">Belajar berbasis kelas</span>
              <span className="footer-badge">Siap build</span>
              <span className="footer-badge">© 2026 Haikal</span>
            </div>
            {!authToken ? (
              <button className="btn outline btn-sm" onClick={() => setShowLogin(true)} disabled={loading}>
                Admin
              </button>
            ) : (
              <button className="btn outline btn-sm" onClick={logout} disabled={loading}>
                Logout
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
