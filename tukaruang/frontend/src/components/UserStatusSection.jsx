import PropTypes from "prop-types";
import MarketingCardIcon from "./MarketingCardIcon";
import StatusBadge from "./StatusBadge";

function UserStatusSection({ isAuthenticated, user, kycStatus }) {
  if (!isAuthenticated) {
    return (
      <article className="card info-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Area Pengguna</p>
            <h2 className="type-heading-2 tone-primary">Fitur Setelah Login</h2>
          </div>
        </div>

        <div className="access-info-list">
          <div className="access-info-item">
            <MarketingCardIcon variant="verify" />
            <strong>Kepatuhan KYC</strong>
            <p>Lengkapi biodata, identitas, selfie, dan dokumen pendukung setelah login.</p>
          </div>
          <div className="access-info-item">
            <MarketingCardIcon variant="route" />
            <strong>Buat Remitansi</strong>
            <p>Simpan transaksi remitansi, lihat status pembayaran, dan pantau riwayat transfer.</p>
          </div>
          <div className="access-info-item">
            <MarketingCardIcon variant="account" />
            <strong>Dashboard Pengguna</strong>
            <p>Lihat status KYC, jumlah transfer, dan ringkasan aktivitas akun Anda.</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card info-card">
      <div className="section-heading">
        <div>
            <p className="section-kicker type-caption tone-brand">Area Pengguna</p>
            <h2 className="type-heading-2 tone-primary">Status akun dan kesiapan transfer</h2>
            <p className="subtitle workspace-status-subtitle type-body tone-secondary">
            Ringkasan ini membantu Anda melihat progres akun dengan warna status yang lebih jelas dan mudah dibaca.
          </p>
        </div>
      </div>
      <div className="status-list">
        <div>
          <MarketingCardIcon variant="account" />
          <span>Nama</span>
          <strong>{user?.fullName || "-"}</strong>
        </div>
        <div>
          <MarketingCardIcon variant="clarity" />
          <span>Email</span>
          <strong>{user?.email || "-"}</strong>
        </div>
        <div>
          <MarketingCardIcon variant="verify" />
          <span>Status KYC</span>
          <strong>
            <StatusBadge
              value={kycStatus?.status || "pending"}
              label={kycStatus?.status ? undefined : "Belum Dikirim"}
            />
          </strong>
        </div>
        <div>
          <MarketingCardIcon variant="secure" />
          <span>Verifikasi Wajah</span>
          <strong>
            <StatusBadge
              value={kycStatus?.faceVerificationStatus || "pending"}
              label={kycStatus?.faceVerificationStatus ? undefined : "Belum Dimulai"}
            />
          </strong>
        </div>
        <div>
          <MarketingCardIcon variant="tracking" />
          <span>Akses Transfer</span>
          <strong>
            <StatusBadge
              value={kycStatus?.status === "approved" ? "active" : "pending"}
              label={kycStatus?.status === "approved" ? "Aktif" : "Menunggu Persetujuan KYC"}
            />
          </strong>
        </div>
      </div>
    </article>
  );
}

UserStatusSection.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    fullName: PropTypes.string,
    email: PropTypes.string,
  }),
  kycStatus: PropTypes.shape({
    status: PropTypes.string,
    faceVerificationStatus: PropTypes.string,
  }),
};

UserStatusSection.defaultProps = {
  user: null,
  kycStatus: null,
};

export default UserStatusSection;
