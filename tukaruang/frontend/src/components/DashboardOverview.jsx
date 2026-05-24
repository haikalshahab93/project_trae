import PropTypes from "prop-types";
import complianceExplainer from "../assets/compliance-explainer.svg";
import workspaceExplainer from "../assets/workspace-explainer.svg";
import { Link } from "react-router-dom";
import { formatNumber } from "../utils/format";
import MarketingCardIcon from "./MarketingCardIcon";
import StatusBadge from "./StatusBadge";
import UserStatusSection from "./UserStatusSection";

function DashboardOverview({ user, summary, kycStatus }) {
  const hasSubmittedKyc = Boolean(kycStatus?.status);

  return (
    <div className="stack">
      <section className="card info-card workspace-hero-card">
        <div className="workspace-hero-copy">
          <p className="section-kicker type-caption tone-brand">Panduan Cepat</p>
          <h2 className="type-heading-2 tone-primary">Semua yang penting setelah login kini lebih mudah dipahami.</h2>
          <p className="subtitle type-body tone-secondary">
            Mulai dari status akun, lengkapi kepatuhan, buat transfer, lalu pantau riwayat dari tampilan yang lebih ramah.
          </p>
        </div>
        <img
          src={workspaceExplainer}
          alt="Ilustrasi dashboard pengguna dengan alur akun, transfer, dan riwayat"
          className="workspace-hero-image"
        />
      </section>

      {!hasSubmittedKyc && (
        <section className="card info-card dashboard-empty-state-card">
          <div className="dashboard-empty-state-copy">
            <p className="section-kicker type-caption tone-brand">KYC Belum Dimulai</p>
            <h2 className="type-heading-2 tone-primary">Akun Anda sudah aktif, sekarang lengkapi KYC agar transfer bisa dibuka.</h2>
            <p className="subtitle dashboard-empty-state-subtitle type-body tone-secondary">
              Isi biodata, verifikasi wajah, dan unggah dokumen pendukung dari halaman kepatuhan agar akun siap
              digunakan untuk bertransaksi.
            </p>
            <div className="hero-cta-row">
              <Link to="/compliance" className="dashboard-empty-state-link">
                Lengkapi KYC Sekarang
              </Link>
            </div>
          </div>
          <img
            src={complianceExplainer}
            alt="Ilustrasi KYC dan verifikasi akun sebelum transfer"
            className="dashboard-empty-state-image"
          />
        </section>
      )}

      <section className="content-grid workspace-grid">
        <article className="card info-card workspace-summary-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker type-caption tone-brand">Ringkasan</p>
              <h2 className="type-heading-2 tone-primary">Hal penting yang perlu Anda cek</h2>
              <p className="subtitle type-body tone-secondary">
                Dashboard dibuat singkat agar Anda langsung tahu status akun, kesiapan transfer, dan aktivitas utama.
              </p>
            </div>
          </div>
          <div className="metrics-list workspace-metrics-list">
            <div>
              <span>Total Transfer</span>
              <strong>{summary?.transferCount || 0}</strong>
            </div>
            <div>
              <span>Volume</span>
              <strong>{formatNumber(summary?.totalVolume || 0)}</strong>
            </div>
            <div>
              <span>Status KYC</span>
              <strong>
                <StatusBadge
                  value={kycStatus?.status || "pending"}
                  label={kycStatus?.status ? undefined : "Belum Dikirim"}
                />
              </strong>
            </div>
            <div>
              <span>Akses Transfer</span>
              <strong>
                <StatusBadge
                  value={kycStatus?.status === "approved" ? "active" : "pending"}
                  label={kycStatus?.status === "approved" ? "Aktif" : "Menunggu KYC"}
                />
              </strong>
            </div>
          </div>
        </article>

        <article className="card info-card workspace-actions-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker type-caption tone-brand">Aksi Cepat</p>
              <h2 className="type-heading-2 tone-primary">Lanjut ke halaman yang dibutuhkan</h2>
            </div>
          </div>
          <div className="access-info-list">
            <Link to="/compliance" className="access-info-item workspace-action-link">
              <MarketingCardIcon variant="verify" />
              <strong>Lengkapi Kepatuhan</strong>
              <p>Isi KYC, verifikasi wajah, dan dokumen jika akun belum siap transfer.</p>
            </Link>
            <Link to="/transfer" className="access-info-item workspace-action-link">
              <MarketingCardIcon variant="route" />
              <strong>Buat Transfer</strong>
              <p>Masuk ke halaman transfer saat Anda siap mengirim dana ke penerima.</p>
            </Link>
            <Link to="/history" className="access-info-item workspace-action-link">
              <MarketingCardIcon variant="tracking" />
              <strong>Lihat Riwayat</strong>
              <p>Pantau transaksi terbaru, status, dan bukti pembayaran dari satu halaman.</p>
            </Link>
          </div>
        </article>
      </section>

      <UserStatusSection isAuthenticated user={user} kycStatus={kycStatus} />
    </div>
  );
}

DashboardOverview.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string,
    email: PropTypes.string,
  }),
  summary: PropTypes.shape({
    transferCount: PropTypes.number,
    totalVolume: PropTypes.number,
  }),
  kycStatus: PropTypes.shape({
    status: PropTypes.string,
  }),
};

DashboardOverview.defaultProps = {
  user: null,
  summary: null,
  kycStatus: null,
};

export default DashboardOverview;
