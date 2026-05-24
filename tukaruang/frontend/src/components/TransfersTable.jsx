import PropTypes from "prop-types";
import historyExplainer from "../assets/history-explainer.svg";
import { getStatusTone } from "../utils/status";
import { formatMoney, formatNumber } from "../utils/format";
import MarketingCardIcon from "./MarketingCardIcon";
import StatusBadge from "./StatusBadge";

const FILE_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(
    /\/api$/,
    "",
  );

function TransfersTable({
  transfers,
  paymentProofFiles,
  setPaymentProofFiles,
  handlePaymentProofUpload,
  loading,
}) {
  if (transfers.length === 0) {
    return (
      <section className="card history-card history-empty-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Riwayat</p>
            <h2 className="type-heading-2 tone-primary">Belum ada transfer yang tersimpan</h2>
            <p className="subtitle type-body tone-secondary">
              Saat Anda mulai membuat transfer, riwayat transaksi dan bukti pembayaran akan muncul di halaman ini.
            </p>
          </div>
        </div>
        <div className="history-visual-card">
          <div className="history-visual-copy">
            <strong className="type-heading-3 tone-primary">Riwayat akan terkumpul di satu tempat</strong>
            <p className="type-body tone-secondary">
              Saat transfer pertama dibuat, Anda bisa memantau status, pembayaran, dan proses pengiriman dari
              halaman ini.
            </p>
          </div>
          <img
            src={historyExplainer}
            alt="Ilustrasi riwayat transfer dan pelacakan transaksi"
            className="history-empty-image"
          />
        </div>
        <div className="history-empty-state">
          <div className="history-empty-copy">
            <MarketingCardIcon variant="tracking" />
            <strong className="type-heading-3 tone-primary">Mulai dari halaman transfer</strong>
            <p className="type-body tone-secondary">
              Setelah transaksi pertama dibuat, Anda bisa kembali ke sini untuk melihat status, pembayaran,
              dan progres pengiriman.
            </p>
          </div>
          <img
            src={historyExplainer}
            alt="Ilustrasi riwayat transfer dan pelacakan transaksi"
            className="history-empty-image"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="card history-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker type-caption tone-brand">Riwayat</p>
          <h2 className="type-heading-2 tone-primary">Riwayat Transfer Terbaru</h2>
          <p className="subtitle type-body tone-secondary">
            Pantau status transaksi, lihat bukti pembayaran, dan lengkapi upload jika masih diperlukan.
          </p>
        </div>
      </div>

      <div className="history-visual-card history-visual-card-compact">
        <div className="history-visual-copy">
          <strong className="type-heading-3 tone-primary">Pantau semua transfer dengan lebih rapi</strong>
          <p className="type-body tone-secondary">
            Lihat status transaksi, pembayaran, dan dokumen pendukung dari satu tampilan yang lebih mudah dipahami.
          </p>
        </div>
        <img
          src={historyExplainer}
          alt="Ilustrasi riwayat transfer dan pelacakan transaksi"
          className="history-empty-image"
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Referensi</th>
              <th>Penerima</th>
              <th>Pair</th>
              <th>Jumlah</th>
              <th>Kurs Sistem</th>
              <th>Diterima</th>
              <th>Status</th>
              <th>Pembayaran</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer._id} className={`history-table-row history-table-row-${getStatusTone(transfer.status)}`}>
                <td>
                  <div className="history-reference">
                    <strong>#{transfer.reference}</strong>
                    <span>ID transaksi</span>
                  </div>
                </td>
                <td>{transfer.recipientName}</td>
                <td>
                  <span className="history-pair-pill">
                    {transfer.fromCurrency}
                    <span className="history-pair-separator" aria-hidden="true">
                      to
                    </span>
                    {transfer.toCurrency}
                  </span>
                </td>
                <td>
                  <div className="history-money-stack">
                    <strong>{formatMoney(transfer.amount, transfer.fromCurrency)}</strong>
                    <span>Dana dikirim</span>
                  </div>
                </td>
                <td>
                  <div className="history-money-stack">
                    <strong>{formatNumber(transfer.displayRate)}</strong>
                    <span>Kurs tampil</span>
                  </div>
                </td>
                <td>
                  <div className="history-money-stack">
                    <strong>{formatMoney(transfer.receiveAmount, transfer.toCurrency)}</strong>
                    <span>Diterima penerima</span>
                  </div>
                </td>
                <td>
                  <StatusBadge value={transfer.status} />
                </td>
                <td>
                  <div className="table-action-cell">
                    {transfer.paymentProof?.path ? (
                      <a
                        href={`${FILE_BASE_URL}${transfer.paymentProof.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        Lihat bukti
                      </a>
                    ) : (
                      <span className="muted-text history-proof-empty">Bukti belum diunggah</span>
                    )}

                    {transfer.status === "pending_payment" && (
                      <>
                        <input
                          className="history-file-input"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(event) =>
                            setPaymentProofFiles((current) => ({
                              ...current,
                              [transfer._id]: event.target.files?.[0] || null,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="history-upload-button"
                          onClick={() => handlePaymentProofUpload(transfer._id)}
                          disabled={loading || !paymentProofFiles[transfer._id]}
                        >
                          Upload Bukti
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

TransfersTable.propTypes = {
  transfers: PropTypes.arrayOf(PropTypes.object).isRequired,
  paymentProofFiles: PropTypes.object.isRequired,
  setPaymentProofFiles: PropTypes.func.isRequired,
  handlePaymentProofUpload: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default TransfersTable;
