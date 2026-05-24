import PropTypes from "prop-types";
import { formatMoney, formatNumber } from "../utils/format";
import quoteExplainer from "../assets/quote-explainer.svg";

const currencyVisualMap = {
  QAR: {
    label: "Qatar",
    flagClassName: "currency-flag currency-flag-qar",
  },
  IDR: {
    label: "Indonesia",
    flagClassName: "currency-flag currency-flag-idr",
  },
};

function QuoteStatusSection({ currencies, quoteForm, setQuoteForm, loading, quote }) {
  const directionLabel =
    quoteForm.from === "QAR"
      ? "Ubah QAR ke Rupiah dengan cepat dan jelas"
      : "Ubah Rupiah ke QAR dengan cepat dan jelas";
  const helperCopy =
    quoteForm.from === "QAR"
      ? "Masukkan jumlah QAR untuk langsung melihat perkiraan rupiah yang akan diterima."
      : "Masukkan jumlah rupiah untuk langsung melihat perkiraan QAR yang akan diterima.";
  const fromCurrency = currencies.find((currency) => currency.code === quoteForm.from);
  const toCurrency = currencies.find((currency) => currency.code === quoteForm.to);
  const fromVisual = currencyVisualMap[quoteForm.from];
  const toVisual = currencyVisualMap[quoteForm.to];
  const handleSwap = () =>
    setQuoteForm((current) => ({
      ...current,
      from: current.to,
      to: current.from,
    }));

  return (
    <div className="stack">
      <article className="card public-showcase-card public-themed-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Akses Umum</p>
            <h2 className="type-heading-2 tone-primary">Cek estimasi kiriman Anda sebelum mulai transfer.</h2>
            <p className="subtitle type-body tone-secondary">
              Pilih koridor populer, lihat biaya lebih awal, dan pahami hasil kiriman Anda dalam beberapa detik.
            </p>
          </div>
        </div>

        <div className="public-showcase-grid">
          <div className="feature-grid">
            <div className="feature-box">
              <strong>Biaya terlihat sejak awal</strong>
              <p>Anda bisa langsung tahu total pembayaran tanpa harus menebak-nebak.</p>
            </div>
            <div className="feature-box">
              <strong>Hasil kiriman lebih jelas</strong>
              <p>Perkiraan dana yang diterima langsung tampil agar keputusan terasa lebih mantap.</p>
            </div>
            <div className="feature-box">
              <strong>Cocok untuk banyak kebutuhan</strong>
              <p>Kirim untuk keluarga, pendidikan, bisnis, atau kebutuhan rutin dengan lebih praktis.</p>
            </div>
            <div className="feature-box">
              <strong>Lebih aman dan nyaman</strong>
              <p>Data penting hanya diproses saat Anda masuk ke akun, sehingga pengalaman tetap terasa aman.</p>
            </div>
          </div>

          <div className="destination-card highlight-destination-card">
            <div className="section-illustration-card">
              <img
                src={quoteExplainer}
                alt="Ilustrasi simulasi kurs dan hasil kiriman"
                className="section-illustration-image"
              />
            </div>
            <div className="destination-chip-list">
              <span className="destination-chip">QAR - Qatari Rial</span>
              <span className="destination-chip">IDR - Indonesian Rupiah</span>
            </div>
            <p className="helper">
              Fokus koridor QAR dan IDR membantu Anda melihat simulasi yang lebih cepat, jelas, dan relevan.
            </p>
          </div>
        </div>
      </article>

      <article className="card quote-calculator-card quote-converter-card">
        <div className="quote-converter-copy">
            <p className="section-kicker type-caption tone-brand">Simulasi Publik</p>
            <h2 className="type-display tone-primary">{directionLabel}</h2>
            <p className="subtitle quote-converter-subtitle type-body-lg tone-secondary">{helperCopy}</p>
          <div className="quote-route-badges">
            <span className="quote-route-pill">
              <span className={fromVisual?.flagClassName || "currency-flag"} aria-hidden="true" />
              {fromVisual?.label || quoteForm.from}
            </span>
            <span className="quote-route-arrow">ke</span>
            <span className="quote-route-pill">
              <span className={toVisual?.flagClassName || "currency-flag"} aria-hidden="true" />
              {toVisual?.label || quoteForm.to}
            </span>
          </div>
        </div>

        <div className="quote-converter-board">
          <label className="quote-amount-card">
            <span className="quote-amount-label type-caption tone-secondary">Anda kirim</span>
            <div className="quote-amount-input-row">
              <input
                type="number"
                min="1"
                placeholder={quoteForm.from === "QAR" ? "4500" : "20000000"}
                value={quoteForm.amount}
                onChange={(event) =>
                  setQuoteForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
              />
              <span className="quote-currency-pill">
                <span className={fromVisual?.flagClassName || "currency-flag"} aria-hidden="true" />
                {fromCurrency?.code || quoteForm.from}
              </span>
            </div>
          </label>

          <button type="button" className="quote-swap-button" onClick={handleSwap}>
            Tukar Arah
          </button>

          <div className="quote-amount-card quote-receiver-card">
            <span className="quote-amount-label type-caption tone-secondary">Penerima mendapat</span>
            <div className="quote-amount-input-row">
              <strong className={loading ? "quote-output-value quote-loading-block" : "quote-output-value"}>
                {quote ? formatMoney(quote.receiveAmount, quoteForm.to) : formatMoney(0, quoteForm.to)}
              </strong>
              <span className="quote-currency-pill">
                <span className={toVisual?.flagClassName || "currency-flag"} aria-hidden="true" />
                {toCurrency?.code || quoteForm.to}
              </span>
            </div>
          </div>
        </div>

        <div className="quote-summary-bar">
          <div className={loading ? "quote-summary-item quote-loading-card" : "quote-summary-item"}>
            <span>FX</span>
            <strong>
              1 {quoteForm.from} = {quote ? formatNumber(quote.displayRate) : "0"} {quoteForm.to}
            </strong>
          </div>
          <div className={loading ? "quote-summary-item quote-loading-card" : "quote-summary-item"}>
            <span>Fee</span>
            <strong>
              {quote ? formatMoney(quote.adminFee, quoteForm.from) : formatMoney(0, quoteForm.from)}
            </strong>
          </div>
          <div className={loading ? "quote-summary-item quote-loading-card" : "quote-summary-item"}>
            <span>Total bayar</span>
            <strong>
              {quote
                ? formatMoney(quote.totalPayable, quoteForm.from)
                : formatMoney(Number(quoteForm.amount || 0), quoteForm.from)}
            </strong>
          </div>
        </div>

        {loading && (
          <div className="quote-loading-row" aria-live="polite">
            <span className="quote-loading-dot" />
            <p className="helper type-body-sm tone-secondary">Memperbarui simulasi kurs...</p>
          </div>
        )}
      </article>
    </div>
  );
}

QuoteStatusSection.propTypes = {
  currencies: PropTypes.arrayOf(PropTypes.object).isRequired,
  quoteForm: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setQuoteForm: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  quote: PropTypes.shape({
    marketRate: PropTypes.number,
    displayRate: PropTypes.number,
    totalPayable: PropTypes.number,
    receiveAmount: PropTypes.number,
    provider: PropTypes.string,
    adminFee: PropTypes.number,
  }),
};

QuoteStatusSection.defaultProps = {
  quote: null,
};

export default QuoteStatusSection;
