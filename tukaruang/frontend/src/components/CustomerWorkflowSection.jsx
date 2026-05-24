import PropTypes from "prop-types";
import complianceExplainer from "../assets/compliance-explainer.svg";
import transferExplainer from "../assets/transfer-explainer.svg";
import MarketingCardIcon from "./MarketingCardIcon";
import SelfieCapture from "./SelfieCapture";
import StatusBadge from "./StatusBadge";

function CustomerWorkflowSection({
  kycForm,
  setKycForm,
  handleKycSubmit,
  loading,
  isAuthenticated,
  kycStatus,
  selfieDataUrl,
  setSelfieDataUrl,
  setIdentityDocument,
  setSupportingDocument,
  transferForm,
  setTransferForm,
  handleTransferSubmit,
  currencies,
  mode,
}) {
  const transferLockedReason = !isAuthenticated
    ? "Login terlebih dahulu untuk mengakses fitur transfer."
    : kycStatus?.status !== "approved"
      ? "Transfer dibuka setelah status KYC Anda disetujui."
      : "";
  const transferPairOptions = currencies.filter(
    (currency) => currency.code === "QAR" || currency.code === "IDR",
  );
  const showKyc = mode === "all" || mode === "kyc";
  const showTransfer = mode === "all" || mode === "transfer";
  const sectionClassName =
    showKyc && showTransfer ? "content-grid" : "content-grid workflow-single-grid";

  return (
    <section className={sectionClassName}>
      {showKyc && (
        <article className="card workflow-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Compliance</p>
            <h2 className="type-heading-2 tone-primary">KYC Formal dan Verifikasi Wajah</h2>
            <p className="subtitle type-body tone-secondary">
              Lengkapi data utama lebih dulu agar akun siap diproses dan transfer bisa dibuka lebih cepat.
            </p>
          </div>
        </div>

        <div className="workflow-visual-card">
          <div className="workflow-visual-copy">
            <strong className="type-heading-3 tone-primary">
              {kycStatus?.status === "approved" ? "KYC sudah siap digunakan" : "Lengkapi KYC agar akun makin siap"}
            </strong>
            <div className="workflow-badge-row">
              <StatusBadge
                value={kycStatus?.status || "pending"}
                label={kycStatus?.status ? undefined : "Belum Dikirim"}
              />
              <StatusBadge
                value={kycStatus?.faceVerificationStatus || "pending"}
                label={kycStatus?.faceVerificationStatus ? undefined : "Wajah Belum Diverifikasi"}
              />
            </div>
            <p className="type-body tone-secondary">
              {kycStatus?.status === "approved"
                ? "Status kepatuhan Anda sudah aktif. Jika ada perubahan data, pastikan dokumen dan informasi tetap akurat."
                : "Isi biodata, unggah dokumen, dan selesaikan verifikasi wajah agar proses review berjalan lebih lancar."}
            </p>
          </div>
          <img
            src={complianceExplainer}
            alt="Ilustrasi proses kepatuhan dan verifikasi akun"
            className="workflow-visual-image"
          />
        </div>

        <form className="form-grid" onSubmit={handleKycSubmit}>
          <div className="inline-fields">
            <input
              placeholder="Nama lengkap"
              value={kycForm.fullName}
              onChange={(event) =>
                setKycForm({ ...kycForm, fullName: event.target.value })
              }
            />
            <input
              placeholder="Telepon"
              value={kycForm.phone}
              onChange={(event) =>
                setKycForm({ ...kycForm, phone: event.target.value })
              }
            />
          </div>

          <div className="inline-fields">
            <input
              type="date"
              value={kycForm.dateOfBirth}
              onChange={(event) =>
                setKycForm({ ...kycForm, dateOfBirth: event.target.value })
              }
            />
            <input
              placeholder="Kewarganegaraan"
              value={kycForm.nationality}
              onChange={(event) =>
                setKycForm({ ...kycForm, nationality: event.target.value })
              }
            />
          </div>

          <textarea
            placeholder="Alamat lengkap"
            value={kycForm.address}
            onChange={(event) =>
              setKycForm({ ...kycForm, address: event.target.value })
            }
          />

          <div className="inline-fields">
            <input
              placeholder="Kota"
              value={kycForm.city}
              onChange={(event) =>
                setKycForm({ ...kycForm, city: event.target.value })
              }
            />
            <input
              placeholder="Negara"
              value={kycForm.country}
              onChange={(event) =>
                setKycForm({ ...kycForm, country: event.target.value })
              }
            />
          </div>

          <div className="inline-fields">
            <input
              placeholder="Pekerjaan"
              value={kycForm.occupation}
              onChange={(event) =>
                setKycForm({ ...kycForm, occupation: event.target.value })
              }
            />
            <input
              placeholder="Jenis identitas"
              value={kycForm.identityType}
              onChange={(event) =>
                setKycForm({ ...kycForm, identityType: event.target.value })
              }
            />
          </div>

          <div className="inline-fields">
            <input
              placeholder="Nomor identitas / KTP"
              value={kycForm.identityNumber}
              onChange={(event) =>
                setKycForm({ ...kycForm, identityNumber: event.target.value })
              }
            />
            <input
              placeholder="NPWP"
              value={kycForm.npwp}
              onChange={(event) => setKycForm({ ...kycForm, npwp: event.target.value })}
            />
          </div>

          <div className="inline-fields">
            <input
              placeholder="Kontak darurat"
              value={kycForm.emergencyContactName}
              onChange={(event) =>
                setKycForm({
                  ...kycForm,
                  emergencyContactName: event.target.value,
                })
              }
            />
            <input
              placeholder="Telepon kontak darurat"
              value={kycForm.emergencyContactPhone}
              onChange={(event) =>
                setKycForm({
                  ...kycForm,
                  emergencyContactPhone: event.target.value,
                })
              }
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={kycForm.livenessConsent}
              onChange={(event) =>
                setKycForm({ ...kycForm, livenessConsent: event.target.checked })
              }
            />
            Saya menyetujui proses selfie dan verifikasi wajah untuk keperluan KYC.
          </label>

          <SelfieCapture value={selfieDataUrl} onCapture={setSelfieDataUrl} />

          <label className="upload-field">
            Upload KTP / Paspor
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setIdentityDocument(event.target.files?.[0] || null)}
            />
          </label>

          <label className="upload-field">
            Upload Dokumen Pendukung
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setSupportingDocument(event.target.files?.[0] || null)}
            />
          </label>

          <textarea
            placeholder="Catatan tambahan untuk tim compliance"
            value={kycForm.notes}
            onChange={(event) => setKycForm({ ...kycForm, notes: event.target.value })}
          />

          <button type="submit" disabled={loading}>
            Kirim KYC
          </button>
        </form>
        </article>
      )}

      {showTransfer && (
        <article className="card workflow-card transfer-workflow-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Remitansi</p>
            <h2 className="type-heading-2 tone-primary">Buat Transfer</h2>
            <p className="subtitle type-body tone-secondary">
              Form transfer memakai koridor QAR dan IDR agar konsisten dengan simulator publik.
            </p>
          </div>
        </div>

        <div className="workflow-visual-card transfer-visual-card">
          <div className="workflow-visual-copy">
            <strong className="type-heading-3 tone-primary">
              {transferLockedReason ? "Lengkapi syarat sebelum membuat transfer" : "Transfer siap dibuat"}
            </strong>
            <div className="workflow-badge-row">
              <StatusBadge
                value={kycStatus?.status === "approved" ? "active" : "pending"}
                label={kycStatus?.status === "approved" ? "Akses Transfer Aktif" : "Akses Transfer Terkunci"}
              />
            </div>
            <p className="type-body tone-secondary">
              {transferLockedReason
                ? "Pastikan akun sudah login dan KYC disetujui agar proses kirim uang bisa dilanjutkan tanpa hambatan."
                : "Masukkan detail penerima, pilih metode pencairan, lalu simpan transfer untuk melanjutkan pembayaran."}
            </p>
          </div>
          <img
            src={transferExplainer}
            alt="Ilustrasi proses pembuatan transfer dan detail penerima"
            className="workflow-visual-image"
          />
        </div>

        <div className="transfer-pair-strip">
          <span className="quote-route-pill">
            <span className="currency-flag currency-flag-qar" aria-hidden="true" />
            Qatar
          </span>
          <span className="quote-route-arrow">ke</span>
          <span className="quote-route-pill">
            <span className="currency-flag currency-flag-idr" aria-hidden="true" />
            Indonesia
          </span>
        </div>

        {transferLockedReason && (
          <div className="inline-notice workflow-empty-state">
            <MarketingCardIcon variant="route" />
            <div>
              <strong>Transfer belum bisa dibuka</strong>
              <p>{transferLockedReason}</p>
            </div>
          </div>
        )}

        <form className="form-grid" onSubmit={handleTransferSubmit}>
          <div className="inline-fields">
            <select
              value={transferForm.fromCurrency}
              disabled={Boolean(transferLockedReason)}
              onChange={(event) =>
                setTransferForm({
                  ...transferForm,
                  fromCurrency: event.target.value,
                })
              }
            >
              {transferPairOptions.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
            <select
              value={transferForm.toCurrency}
              disabled={Boolean(transferLockedReason)}
              onChange={(event) =>
                setTransferForm({
                  ...transferForm,
                  toCurrency: event.target.value,
                })
              }
            >
              {transferPairOptions.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            placeholder="Jumlah"
            value={transferForm.amount}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({ ...transferForm, amount: event.target.value })
            }
          />
          <input
            placeholder="Nama penerima"
            value={transferForm.recipientName}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({
                ...transferForm,
                recipientName: event.target.value,
              })
            }
          />
          <input
            placeholder="Nomor telepon penerima"
            value={transferForm.recipientPhone}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({
                ...transferForm,
                recipientPhone: event.target.value,
              })
            }
          />
          <input
            placeholder="Negara tujuan"
            value={transferForm.recipientCountry}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({
                ...transferForm,
                recipientCountry: event.target.value,
              })
            }
          />
          <input
            placeholder="Bank penerima"
            value={transferForm.recipientBank}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({
                ...transferForm,
                recipientBank: event.target.value,
              })
            }
          />
          <input
            placeholder="Nomor rekening"
            value={transferForm.recipientAccountNumber}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({
                ...transferForm,
                recipientAccountNumber: event.target.value,
              })
            }
          />
          <select
            value={transferForm.payoutMethod}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({
                ...transferForm,
                payoutMethod: event.target.value,
              })
            }
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash_pickup">Cash Pickup</option>
            <option value="mobile_wallet">Mobile Wallet</option>
          </select>
          <input
            placeholder="Tujuan transfer"
            value={transferForm.purpose}
            disabled={Boolean(transferLockedReason)}
            onChange={(event) =>
              setTransferForm({ ...transferForm, purpose: event.target.value })
            }
          />
          <button type="submit" disabled={loading || Boolean(transferLockedReason)}>
            Simpan Transfer
          </button>
        </form>
        </article>
      )}
    </section>
  );
}

CustomerWorkflowSection.propTypes = {
  kycForm: PropTypes.object.isRequired,
  setKycForm: PropTypes.func.isRequired,
  handleKycSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  kycStatus: PropTypes.shape({
    status: PropTypes.string,
    faceVerificationStatus: PropTypes.string,
  }),
  selfieDataUrl: PropTypes.string.isRequired,
  setSelfieDataUrl: PropTypes.func.isRequired,
  setIdentityDocument: PropTypes.func.isRequired,
  setSupportingDocument: PropTypes.func.isRequired,
  transferForm: PropTypes.object.isRequired,
  setTransferForm: PropTypes.func.isRequired,
  handleTransferSubmit: PropTypes.func.isRequired,
  currencies: PropTypes.arrayOf(PropTypes.object).isRequired,
  mode: PropTypes.oneOf(["all", "kyc", "transfer"]),
};

CustomerWorkflowSection.defaultProps = {
  kycStatus: null,
  mode: "all",
};

export default CustomerWorkflowSection;
