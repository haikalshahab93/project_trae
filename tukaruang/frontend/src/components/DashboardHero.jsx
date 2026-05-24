import PropTypes from "prop-types";
import heroExplainer from "../assets/hero-explainer.svg";
import { formatNumber } from "../utils/format";
import MarketingCardIcon from "./MarketingCardIcon";
import TukarUangLogo from "./TukarUangLogo";

function DashboardHero({
  isAuthenticated,
  user,
  summary,
  onLogout,
  onGoToDashboard,
  onScrollToQuote,
  onGoToLogin,
  onGoToRegister,
}) {
  const navLinks = [
    { label: "Simulasi", href: "#public-quote" },
    { label: "Layanan", href: "#public-services" },
    { label: "Cara Kerja", href: "#public-workflow" },
    { label: "Mengapa Kami", href: "#public-benefits" },
    { label: "FAQ", href: "#public-faq" },
  ];

  const highlightRows = isAuthenticated
    ? [
        {
          label: "Total Transfer",
          value: formatNumber(summary?.transferCount || 0),
          change: "Berjalan",
        },
        {
          label: "Volume",
          value: formatNumber(summary?.totalVolume || 0),
          change: "QAR",
        },
        {
          label: "Profit Est.",
          value: formatNumber(summary?.totalProfit || 0),
          change: "Langsung",
        },
        {
          label: "Status Akun",
          value: user?.role || "Pengguna",
          change: "Aktif",
        },
      ]
    : [
        {
          label: "Kurs Jelas",
          value: "QAR ke IDR",
          change: "Favorit",
        },
        {
          label: "Biaya Terlihat",
          value: "Tanpa Tebak-tebakan",
          change: "Transparan",
        },
        {
          label: "Penerimaan Fleksibel",
          value: "Bank, cash, wallet",
          change: "Lengkap",
        },
        {
          label: "Status Mudah Dicek",
          value: "Lebih Tenang",
          change: "Praktis",
        },
      ];

  return (
    <>
      <header className="topbar">
        <div className="hero-shell">
          <div className="hero-network hero-network-left" />
          <div className="hero-network hero-network-right" />

          <div className="hero-navbar">
            <div className="hero-brand">
              <TukarUangLogo compact light showTagline={false} />
            </div>

            <nav className="hero-main-nav" aria-label="Navigasi utama">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="hero-main-nav-link">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="topbar-actions">
              {!isAuthenticated && (
                <button type="button" className="hero-login-button" onClick={onGoToLogin}>
                  Masuk
                </button>
              )}
              {isAuthenticated && (
                <button type="button" className="hero-signup-button" onClick={onGoToDashboard}>
                  Dashboard
                </button>
              )}
              <button
                type="button"
                className={isAuthenticated ? "ghost-button" : "hero-signup-button"}
                onClick={isAuthenticated ? onLogout : onGoToRegister}
              >
                {isAuthenticated ? "Keluar" : "Daftar"}
              </button>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-copy">
              <p className="eyebrow type-caption">Kirim Uang Qatar ke Indonesia</p>
              <h1 className="type-display tone-inverse">
                Kirim uang dengan kurs yang jelas, proses yang tenang, dan hasil yang mudah dipahami.
              </h1>
              <p className="subtitle type-body-lg tone-inverse-secondary">
                Cek estimasi dalam hitungan detik, lihat total pembayaran dengan transparan,
                lalu lanjutkan transfer saat Anda benar-benar siap.
              </p>
              <div className="hero-tags">
                <span className="hero-tag">Biaya Transparan</span>
                <span className="hero-tag">Kurs Real-Time</span>
                <span className="hero-tag">Proses Lebih Tenang</span>
                <span className="hero-tag">Status Mudah Dicek</span>
              </div>
              <div className="hero-mini-nav">
                <a href="#public-quote" className="mini-nav-link">
                  Simulasi
                </a>
                <a href="#public-services" className="mini-nav-link">
                  Layanan
                </a>
                <a href="#public-benefits" className="mini-nav-link">
                  Kenapa Kami
                </a>
                <a href="#public-faq" className="mini-nav-link">
                  FAQ
                </a>
                <button
                  type="button"
                  className="mini-nav-link mini-nav-button"
                  onClick={isAuthenticated ? onGoToDashboard : onGoToLogin}
                >
                  {isAuthenticated ? "Dashboard" : "Area User"}
                </button>
              </div>
              <div className="hero-cta-row">
                <button type="button" onClick={onScrollToQuote}>
                  {isAuthenticated ? "Lihat Simulasi" : "Cek Estimasi"}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={isAuthenticated ? onGoToDashboard : onGoToLogin}
                >
                  {isAuthenticated ? "Lihat Dashboard" : "Masuk ke Akun"}
                </button>
              </div>
              <span className="status-badge">
                {isAuthenticated
                  ? `Selamat datang kembali, ${user.fullName}. Dashboard Anda siap dibuka kapan saja.`
                  : "Cek estimasi sekarang, lalu lanjutkan transfer saat Anda siap"}
              </span>
            </div>

            <div className="hero-side-stack">
              <article className="hero-visual-card">
                <div className="hero-visual-copy">
                  <strong className="type-title tone-inverse">
                    {isAuthenticated ? "Area pengguna lebih terarah" : "Lihat hasil kiriman sebelum lanjut"}
                  </strong>
                  <p className="type-body tone-inverse-secondary">
                    {isAuthenticated
                      ? "Dashboard, kepatuhan, transfer, dan riwayat kini lebih mudah dipahami dari tampilan yang rapi."
                      : "Biaya, hasil kiriman, dan langkah berikutnya ditampilkan dengan cara yang lebih mudah dipahami."}
                  </p>
                </div>
                <img
                  src={heroExplainer}
                  alt="Ilustrasi alur kirim uang dengan estimasi, keamanan, dan status transaksi"
                  className="hero-visual-image"
                />
              </article>

              <article className="hero-market-card">
                <div className="hero-market-top">
                  <p className="hero-market-label type-caption">
                    {isAuthenticated ? "Ringkasan Aktivitas" : "Koridor Favorit Pelanggan"}
                  </p>
                  <strong className="hero-market-value">
                    {isAuthenticated
                      ? formatNumber(summary?.totalVolume || 0)
                      : "QAR -> IDR"}
                  </strong>
                  <span className="hero-market-change">
                    {isAuthenticated
                      ? "Volume Pengiriman"
                      : "Lebih mudah cek biaya, hasil kiriman, dan metode penerimaan"}
                  </span>
                </div>

                <div className="hero-market-list">
                  {highlightRows.map((item) => (
                    <div key={item.label} className="hero-market-row">
                      <div className="hero-market-row-main">
                        <span className="hero-market-dot" />
                        <div>
                          <strong>{item.label}</strong>
                          <p>{item.change}</p>
                        </div>
                      </div>
                      <span className="hero-market-row-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </header>

      <section className="hero-grid" id="public-services">
        <article className="card hero-card public-themed-card">
          <p className="section-kicker">Layanan Utama</p>
          <h2>Semua yang dibutuhkan untuk kirim uang ada dalam alur yang terasa sederhana.</h2>
          <div className="feature-grid">
            <div className="feature-box">
              <MarketingCardIcon variant="clarity" />
              <strong>Cek hasil kiriman lebih awal</strong>
              <p>Lihat estimasi kurs, biaya, dan dana yang diterima sebelum Anda melanjutkan transfer.</p>
            </div>
            <div className="feature-box">
              <MarketingCardIcon variant="shield" />
              <strong>Proses terasa lebih aman</strong>
              <p>Data penting diproses melalui alur akun dan kepatuhan agar transaksi berjalan lebih tenang.</p>
            </div>
            <div className="feature-box">
              <MarketingCardIcon variant="flexible" />
              <strong>Penerimaan lebih fleksibel</strong>
              <p>Pilih penerimaan ke rekening bank, cash pickup, atau mobile wallet sesuai kebutuhan.</p>
            </div>
            <div className="feature-box">
              <MarketingCardIcon variant="tracking" />
              <strong>Status mudah dipantau</strong>
              <p>Cek progres transfer dan bukti pembayaran dengan lebih rapi dari area pengguna.</p>
            </div>
          </div>
        </article>

        <article className="card metrics-card public-themed-card">
          <p className="section-kicker">Sorotan Utama</p>
          <h2>{isAuthenticated ? "Ringkasan Aktivitas Anda" : "Alasan pelanggan merasa lebih nyaman"}</h2>
          {isAuthenticated ? (
            <div className="metrics-list">
              <div>
                <span>Total Transfer</span>
                <strong>{summary?.transferCount || 0}</strong>
              </div>
              <div>
                <span>Volume Pengiriman</span>
                <strong>{formatNumber(summary?.totalVolume || 0)}</strong>
              </div>
              <div>
                <span>Estimasi Profit</span>
                <strong>{formatNumber(summary?.totalProfit || 0)}</strong>
              </div>
            </div>
          ) : (
            <div className="public-promise-list">
              <div className="promise-item">
                <strong>Biaya terlihat sebelum Anda kirim</strong>
                <p>Tidak perlu menebak total pembayaran karena estimasi langsung tampil di awal.</p>
              </div>
              <div className="promise-item">
                <strong>Alur terasa lebih mudah dipahami</strong>
                <p>Dari cek kurs sampai lanjut transaksi, setiap langkah dibuat ringkas dan jelas.</p>
              </div>
              <div className="promise-item">
                <strong>Penerima punya lebih banyak pilihan</strong>
                <p>Bank transfer, cash pickup, dan wallet membantu kiriman menyesuaikan kebutuhan penerima.</p>
              </div>
            </div>
          )}
        </article>
      </section>
    </>
  );
}

DashboardHero.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    fullName: PropTypes.string,
    role: PropTypes.string,
  }),
  summary: PropTypes.shape({
    transferCount: PropTypes.number,
    totalVolume: PropTypes.number,
    totalProfit: PropTypes.number,
  }),
  onLogout: PropTypes.func.isRequired,
  onGoToDashboard: PropTypes.func.isRequired,
  onScrollToQuote: PropTypes.func.isRequired,
  onGoToLogin: PropTypes.func.isRequired,
  onGoToRegister: PropTypes.func.isRequired,
};

DashboardHero.defaultProps = {
  user: null,
  summary: null,
};

export default DashboardHero;
