import PropTypes from "prop-types";
import { formatMoney, formatNumber } from "../utils/format";
import StatusBadge from "./StatusBadge";

const FILE_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(
    /\/api$/,
    "",
  );

function AdminPanel({
  adminSummary,
  adminUsers,
  adminTransfers,
  adminFilters,
  setAdminFilters,
  reviewForm,
  setReviewForm,
  transferUpdateForm,
  setTransferUpdateForm,
  handleAdminKycReview,
  handleAdminTransferUpdate,
  loading,
}) {
  return (
    <>
      <section className="card admin-summary-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Admin Workspace</p>
            <h2 className="type-heading-2 tone-primary">Panel Admin dan Compliance</h2>
            <p className="subtitle type-body tone-secondary">
              Kelola verifikasi KYC, pantau transaksi, dan update status operasional.
            </p>
          </div>
        </div>

        <div className="metrics-list">
          <div>
            <span>Total User</span>
            <strong>{adminSummary?.userCount || 0}</strong>
          </div>
          <div>
            <span>KYC Pending</span>
            <strong>{adminSummary?.pendingKycCount || 0}</strong>
          </div>
          <div>
            <span>Total Transfer</span>
            <strong>{adminSummary?.transferCount || 0}</strong>
          </div>
          <div>
            <span>Volume Global</span>
            <strong>{formatNumber(adminSummary?.totalVolume || 0)}</strong>
          </div>
          <div>
            <span>Profit Global</span>
            <strong>{formatNumber(adminSummary?.totalProfit || 0)}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="card">
          <div className="section-heading">
            <div>
              <p className="section-kicker type-caption tone-brand">KYC Review</p>
              <h2 className="type-heading-2 tone-primary">Review KYC</h2>
            </div>
            <div className="inline-fields">
              <input
                placeholder="Cari user / email / identitas"
                value={adminFilters.userKeyword}
                onChange={(event) =>
                  setAdminFilters((current) => ({
                    ...current,
                    userKeyword: event.target.value,
                  }))
                }
              />
              <select
                value={adminFilters.userKycStatus}
                onChange={(event) =>
                  setAdminFilters((current) => ({
                    ...current,
                    userKycStatus: event.target.value,
                  }))
                }
              >
                <option value="">Semua status</option>
                <option value="pending_review">Pending review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="not_submitted">Belum submit</option>
              </select>
            </div>
          </div>

          <div className="admin-list">
            {adminUsers.length === 0 && (
              <div className="admin-item muted-box type-body-sm tone-muted">Tidak ada data user yang cocok.</div>
            )}

            {adminUsers.map((adminUser) => {
              const currentReview = reviewForm[adminUser.id] || {
                status:
                  adminUser.kyc?.status === "approved" ? "approved" : "pending_review",
                notes: adminUser.kyc?.notes || "",
              };

              return (
                <div className="admin-item" key={adminUser.id}>
                  <div className="admin-item-header">
                    <div>
                      <strong className="type-title tone-primary">{adminUser.fullName}</strong>
                      <p className="type-body-sm tone-secondary">{adminUser.email}</p>
                    </div>
                    <StatusBadge value={adminUser.kyc?.status || "pending"} label={adminUser.kyc?.status || "not_submitted"} />
                  </div>
                  <p className="type-body-sm tone-secondary">
                    Identitas: {adminUser.profile?.identityType || "-"} /{" "}
                    {adminUser.profile?.identityNumber || "-"}
                  </p>
                  <p className="type-body-sm tone-secondary">
                    Face verification: {adminUser.kyc?.faceVerificationStatus || "not_started"}
                  </p>
                  <p className="type-body-sm tone-secondary">Reviewer: {adminUser.kyc?.reviewedBy || "-"}</p>
                  <div className="inline-fields">
                    <select
                      value={currentReview.status}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          [adminUser.id]: {
                            ...currentReview,
                            status: event.target.value,
                          },
                        }))
                      }
                    >
                      <option value="pending_review">Pending review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAdminKycReview(adminUser.id)}
                      disabled={loading}
                    >
                      Simpan Review
                    </button>
                  </div>
                  <textarea
                    placeholder="Catatan review KYC"
                    value={currentReview.notes}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        [adminUser.id]: {
                          ...currentReview,
                          notes: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </article>

        <article className="card">
          <div className="section-heading">
            <div>
              <p className="section-kicker type-caption tone-brand">Transfer Ops</p>
              <h2 className="type-heading-2 tone-primary">Operasional Transfer</h2>
            </div>
            <div className="inline-fields">
              <input
                placeholder="Cari referensi / pengirim / penerima"
                value={adminFilters.transferKeyword}
                onChange={(event) =>
                  setAdminFilters((current) => ({
                    ...current,
                    transferKeyword: event.target.value,
                  }))
                }
              />
              <select
                value={adminFilters.transferStatus}
                onChange={(event) =>
                  setAdminFilters((current) => ({
                    ...current,
                    transferStatus: event.target.value,
                  }))
                }
              >
                <option value="">Semua status</option>
                <option value="pending_payment">Pending payment</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="admin-list">
            {adminTransfers.length === 0 && (
                <div className="admin-item muted-box type-body-sm tone-muted">
                Tidak ada data transfer yang cocok.
              </div>
            )}

            {adminTransfers.map((adminTransfer) => {
              const currentTransferUpdate = transferUpdateForm[adminTransfer._id] || {
                status: adminTransfer.status,
                statusNotes: adminTransfer.statusNotes || "",
              };

              return (
                <div className="admin-item" key={adminTransfer._id}>
                  <div className="admin-item-header">
                    <div>
                      <strong className="type-title tone-primary">{adminTransfer.reference}</strong>
                      <p className="type-body-sm tone-secondary">
                        {adminTransfer.senderName} ke {adminTransfer.recipientName}
                      </p>
                    </div>
                    <StatusBadge value={adminTransfer.status} />
                  </div>
                  <p className="type-body-sm tone-secondary">
                    Pair: {adminTransfer.fromCurrency}/{adminTransfer.toCurrency} | Jumlah:{" "}
                    {formatMoney(adminTransfer.amount, adminTransfer.fromCurrency)}
                  </p>
                  <p className="type-body-sm tone-secondary">
                    Diterima tujuan:{" "}
                    {formatMoney(
                      adminTransfer.receiveAmount,
                      adminTransfer.toCurrency,
                    )}
                  </p>
                  <p className="type-body-sm tone-secondary">
                    Bukti pembayaran:{" "}
                    {adminTransfer.paymentProof?.path ? (
                      <a
                        href={`${FILE_BASE_URL}${adminTransfer.paymentProof.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        {adminTransfer.paymentProof.originalName || "Lihat file"}
                      </a>
                    ) : (
                      "Belum ada"
                    )}
                  </p>
                  <p className="type-body-sm tone-secondary">
                    Reviewer bukti bayar: {adminTransfer.paymentProof?.reviewedBy || "-"}
                  </p>
                  <p className="type-body-sm tone-secondary">Updater terakhir: {adminTransfer.updatedBy || "-"}</p>
                  <div className="inline-fields">
                    <select
                      value={currentTransferUpdate.status}
                      onChange={(event) =>
                        setTransferUpdateForm((current) => ({
                          ...current,
                          [adminTransfer._id]: {
                            ...currentTransferUpdate,
                            status: event.target.value,
                          },
                        }))
                      }
                    >
                      <option value="pending_payment">Pending payment</option>
                      <option value="processing">Processing</option>
                      <option value="paid">Paid</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAdminTransferUpdate(adminTransfer._id)}
                      disabled={loading}
                    >
                      Update Status
                    </button>
                  </div>
                  <textarea
                    placeholder="Catatan status transfer"
                    value={currentTransferUpdate.statusNotes}
                    onChange={(event) =>
                      setTransferUpdateForm((current) => ({
                        ...current,
                        [adminTransfer._id]: {
                          ...currentTransferUpdate,
                          statusNotes: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}

AdminPanel.propTypes = {
  adminSummary: PropTypes.shape({
    userCount: PropTypes.number,
    pendingKycCount: PropTypes.number,
    transferCount: PropTypes.number,
    totalProfit: PropTypes.number,
    totalVolume: PropTypes.number,
  }),
  adminUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
  adminTransfers: PropTypes.arrayOf(PropTypes.object).isRequired,
  adminFilters: PropTypes.shape({
    userKeyword: PropTypes.string,
    userKycStatus: PropTypes.string,
    transferKeyword: PropTypes.string,
    transferStatus: PropTypes.string,
  }).isRequired,
  setAdminFilters: PropTypes.func.isRequired,
  reviewForm: PropTypes.object.isRequired,
  setReviewForm: PropTypes.func.isRequired,
  transferUpdateForm: PropTypes.object.isRequired,
  setTransferUpdateForm: PropTypes.func.isRequired,
  handleAdminKycReview: PropTypes.func.isRequired,
  handleAdminTransferUpdate: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

AdminPanel.defaultProps = {
  adminSummary: null,
};

export default AdminPanel;
