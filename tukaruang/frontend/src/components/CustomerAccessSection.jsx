import PropTypes from "prop-types";
import TukarUangLogo from "./TukarUangLogo";

function CustomerAccessSection({
  mode,
  registerForm,
  setRegisterForm,
  loginForm,
  setLoginForm,
  handleRegister,
  handleLogin,
  loading,
  onGoToLogin,
  onGoToRegister,
}) {
  const isLoginMode = mode === "login";

  return (
    <section className="auth-shell">
      <article className="auth-panel auth-form-panel">
        <div className="auth-brand-row">
          <TukarUangLogo light showTagline={false} className="auth-logo" />
          <div className="auth-tabs">
            <button
              type="button"
              className={isLoginMode ? "auth-tab active" : "auth-tab"}
              onClick={onGoToLogin}
            >
              Masuk
            </button>
            <button
              type="button"
              className={!isLoginMode ? "auth-tab active" : "auth-tab"}
              onClick={onGoToRegister}
            >
              Daftar
            </button>
          </div>
        </div>

        {isLoginMode ? (
          <>
            <div className="auth-copy">
              <p className="section-kicker type-caption tone-brand">Halo</p>
              <h2 className="type-heading-2 tone-inverse">Masuk ke akun Anda</h2>
              <p className="auth-subtitle type-body tone-inverse-secondary">
                Lanjutkan ke area pengguna untuk mengakses KYC, remitansi, dan riwayat transaksi.
              </p>
            </div>
            <form className="form-grid auth-form-grid" onSubmit={handleLogin}>
              <label className="auth-field">
                <span className="type-body-sm">Email</span>
                <input
                  placeholder="Masukkan email Anda"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, email: event.target.value })
                  }
                />
              </label>
              <label className="auth-field">
                <span className="type-body-sm">Kata sandi</span>
                <input
                  placeholder="Masukkan kata sandi"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, password: event.target.value })
                  }
                />
              </label>
              <label className="auth-check-row">
                <input type="checkbox" defaultChecked />
                <span className="type-body-sm tone-muted">Tetap masuk di perangkat ini</span>
              </label>
              <button type="submit" disabled={loading} className="auth-submit-button">
                Masuk
              </button>
              <p className="auth-footnote type-body-sm tone-muted">
                Belum punya akun?{" "}
                <button type="button" className="auth-link-button" onClick={onGoToRegister}>
                  Daftar sekarang
                </button>
              </p>
            </form>
          </>
        ) : (
          <>
            <div className="auth-copy">
              <p className="section-kicker type-caption tone-brand">Pengguna Baru</p>
              <h2 className="type-heading-2 tone-inverse">Buat akun Tukar Uang</h2>
              <p className="auth-subtitle type-body tone-inverse-secondary">
                Daftar untuk mulai mengakses fitur KYC, transfer internasional, dan pelacakan status.
              </p>
            </div>
            <form className="form-grid auth-form-grid" onSubmit={handleRegister}>
              <label className="auth-field">
                <span className="type-body-sm">Nama lengkap</span>
                <input
                  placeholder="Masukkan nama lengkap"
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, fullName: event.target.value })
                  }
                />
              </label>
              <label className="auth-field">
                <span className="type-body-sm">Email</span>
                <input
                  placeholder="Masukkan email aktif"
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, email: event.target.value })
                  }
                />
              </label>
              <label className="auth-field">
                <span className="type-body-sm">Nomor telepon</span>
                <input
                  placeholder="Masukkan nomor telepon"
                  value={registerForm.phone}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, phone: event.target.value })
                  }
                />
              </label>
              <label className="auth-field">
                <span className="type-body-sm">Kata sandi</span>
                <input
                  placeholder="Buat kata sandi"
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, password: event.target.value })
                  }
                />
              </label>
              <button type="submit" disabled={loading} className="auth-submit-button">
                Buat Akun
              </button>
              <p className="auth-footnote type-body-sm tone-muted">
                Sudah punya akun?{" "}
                <button type="button" className="auth-link-button" onClick={onGoToLogin}>
                  Masuk di sini
                </button>
              </p>
            </form>
          </>
        )}
      </article>

      <article className="auth-panel auth-visual-panel">
        <div className="auth-visual-copy">
          <TukarUangLogo light className="auth-showcase-logo" />
          <p className="section-kicker type-caption tone-brand">Selamat Datang</p>
          <h2 className="type-heading-2 tone-inverse">Platform tukar uang yang rapi, cepat, dan mudah dipahami.</h2>
          <p className="auth-subtitle type-body tone-inverse-secondary">
            Tukar Uang membantu pengguna melihat estimasi kurs, menyelesaikan kepatuhan,
            dan melanjutkan remitansi dengan alur yang lebih profesional.
          </p>
        </div>

        <div className="auth-visual-illustration" aria-hidden="true">
          <div className="auth-monitor">
            <div className="auth-monitor-screen">
              <span className="auth-pin auth-pin-one" />
              <span className="auth-pin auth-pin-two" />
              <span className="auth-pin auth-pin-three" />
              <div className="auth-screen-grid" />
            </div>
            <div className="auth-monitor-base" />
          </div>
          <div className="auth-float-card auth-float-card-left">
            <strong className="type-title tone-inverse">Kurs Live</strong>
            <span className="type-body-sm tone-inverse-secondary">Estimasi real-time</span>
          </div>
          <div className="auth-float-card auth-float-card-right">
            <strong className="type-title tone-inverse">KYC Aman</strong>
            <span className="type-body-sm tone-inverse-secondary">Dokumen terverifikasi</span>
          </div>
        </div>

        <div className="auth-note-grid">
          <div className="auth-note-card">
            <strong className="type-title tone-inverse">Untuk Pengguna</strong>
            <p className="type-body-sm tone-inverse-secondary">
              Masuk untuk mengakses KYC, remitansi, bukti pembayaran, dan riwayat transaksi.
            </p>
          </div>
          <div className="auth-note-card">
            <strong className="type-title tone-inverse">Untuk Admin</strong>
            <p className="type-body-sm tone-inverse-secondary">
              Gunakan akun admin untuk meninjau kepatuhan dan memantau operasional transfer.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

CustomerAccessSection.propTypes = {
  mode: PropTypes.oneOf(["login", "register"]).isRequired,
  registerForm: PropTypes.shape({
    fullName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  setRegisterForm: PropTypes.func.isRequired,
  loginForm: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  setLoginForm: PropTypes.func.isRequired,
  handleRegister: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onGoToLogin: PropTypes.func.isRequired,
  onGoToRegister: PropTypes.func.isRequired,
};

export default CustomerAccessSection;
