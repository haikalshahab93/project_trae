import trustExplainer from "../assets/trust-explainer.svg";
import workflowExplainer from "../assets/workflow-explainer.svg";
import MarketingCardIcon from "./MarketingCardIcon";

function PublicMarketingSections() {
  return (
    <div className="stack">
      <section className="card public-themed-card public-flow-card" id="public-workflow">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Cara Kerja</p>
            <h2 className="type-heading-2 tone-primary">
              Dari cek kurs sampai uang terkirim, semuanya dibuat lebih singkat dan terasa ringan.
            </h2>
            <p className="subtitle type-body tone-secondary">
              Anda tidak perlu melewati langkah yang membingungkan. Semua alur dirancang agar cepat dipahami sejak kunjungan pertama.
            </p>
          </div>
        </div>
        <div className="story-visual-card">
          <div className="story-visual-copy">
            <strong className="type-heading-3 tone-primary">Lihat alurnya dalam satu pandangan</strong>
            <p className="type-body tone-secondary">
              Dari cek estimasi sampai memantau status transfer, proses dibuat agar cepat dipahami tanpa
              membingungkan user baru.
            </p>
          </div>
          <img
            src={workflowExplainer}
            alt="Ilustrasi alur kirim uang dari simulasi sampai transfer selesai"
            className="story-visual-image"
          />
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">1</span>
            <strong>Cek estimasi</strong>
            <p>Lihat kurs, fee, dan hasil kiriman hanya dalam beberapa detik.</p>
          </article>
          <article className="step-card">
            <span className="step-number">2</span>
            <strong>Buat akun</strong>
            <p>Masuk atau daftar saat Anda siap melanjutkan transfer dengan lebih aman.</p>
          </article>
          <article className="step-card">
            <span className="step-number">3</span>
            <strong>Lengkapi kepatuhan</strong>
            <p>Lengkapi KYC dan verifikasi wajah agar transaksi berjalan lancar dan terpercaya.</p>
          </article>
          <article className="step-card">
            <span className="step-number">4</span>
            <strong>Kirim dan pantau</strong>
            <p>Kirim transfer, unggah bukti pembayaran, lalu pantau statusnya dengan lebih tenang.</p>
          </article>
        </div>
      </section>

      <section className="card public-themed-card public-benefit-card" id="public-benefits">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Kenapa Memilih Kami</p>
            <h2 className="type-heading-2 tone-primary">
              Keputusan kirim uang terasa lebih mantap saat semua informasi penting tampil di depan.
            </h2>
            <p className="subtitle type-body tone-secondary">
              Kami membantu Anda merasa lebih yakin sebelum transfer dimulai, bukan setelah semuanya terlanjur berjalan.
            </p>
          </div>
        </div>
        <div className="benefit-grid">
          <article className="benefit-card">
            <MarketingCardIcon variant="clarity" />
            <strong>Biaya dan hasil terlihat lebih awal</strong>
            <p>Anda bisa melihat total bayar dan estimasi dana diterima sebelum mengambil keputusan.</p>
          </article>
          <article className="benefit-card">
            <MarketingCardIcon variant="route" />
            <strong>Alur terasa lebih mudah diikuti</strong>
            <p>Setiap langkah dibuat jelas agar Anda tidak perlu bingung di tengah proses pengiriman.</p>
          </article>
          <article className="benefit-card">
            <MarketingCardIcon variant="flexible" />
            <strong>Penerimaan tetap fleksibel</strong>
            <p>Pilih bank transfer, cash pickup, atau mobile wallet sesuai kebutuhan orang yang menerima.</p>
          </article>
          <article className="benefit-card">
            <MarketingCardIcon variant="tracking" />
            <strong>Status lebih mudah dipantau</strong>
            <p>Perjalanan transfer dan bukti pembayaran bisa dilihat lebih rapi dari akun Anda.</p>
          </article>
        </div>
      </section>

      <section className="card trust-band-card public-themed-card" id="public-trust">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">Trust dan Transparansi</p>
            <h2 className="type-heading-2 tone-primary">
              Rasa aman dan transparansi kami tampilkan sejak awal agar Anda lebih yakin untuk lanjut.
            </h2>
            <p className="subtitle type-body tone-secondary">
              Saat kirim uang untuk orang tercinta, yang dibutuhkan bukan hanya cepat, tapi juga jelas dan menenangkan.
            </p>
          </div>
        </div>
        <div className="story-visual-card trust-visual-card">
          <div className="story-visual-copy">
            <strong className="type-heading-3 tone-primary">Lebih yakin sebelum kirim</strong>
            <p className="type-body tone-secondary">
              Kurs, fee, keamanan data, dan status transaksi ditampilkan dengan cara yang lebih jelas agar user
              merasa lebih tenang.
            </p>
          </div>
          <img
            src={trustExplainer}
            alt="Ilustrasi keamanan data dan transparansi transaksi"
            className="story-visual-image"
          />
        </div>
        <div className="trust-grid">
          <article className="trust-item">
            <MarketingCardIcon variant="clarity" />
            <strong>Kurs dan fee muncul sebelum Anda lanjut</strong>
            <p>Anda bisa melihat estimasi transfer lebih awal tanpa harus masuk ke akun terlebih dahulu.</p>
          </article>
          <article className="trust-item">
            <MarketingCardIcon variant="flexible" />
            <strong>Penerimaan bisa disesuaikan</strong>
            <p>Penerima dapat memilih metode yang paling nyaman sesuai kondisi dan kebutuhan.</p>
          </article>
          <article className="trust-item">
            <MarketingCardIcon variant="secure" />
            <strong>Data penting tetap terlindungi</strong>
            <p>Informasi sensitif hanya diproses di area akun agar pengalaman tetap aman dan profesional.</p>
          </article>
          <article className="trust-item">
            <MarketingCardIcon variant="tracking" />
            <strong>Status transaksi mudah diikuti</strong>
            <p>Setelah login, Anda bisa memantau progres transfer dengan lebih jelas dari satu tempat.</p>
          </article>
        </div>
      </section>

      <section className="card faq-card public-themed-card" id="public-faq">
        <div className="section-heading">
          <div>
            <p className="section-kicker type-caption tone-brand">FAQ</p>
            <h2 className="type-heading-2 tone-primary">
              Pertanyaan umum kami jawab dengan singkat agar Anda cepat paham dan cepat lanjut.
            </h2>
            <p className="subtitle type-body tone-secondary">
              Kami merangkum hal yang paling sering ditanyakan agar Anda bisa mengambil keputusan dengan lebih nyaman.
            </p>
          </div>
        </div>
        <div className="faq-list">
          <details className="faq-item">
            <summary className="faq-summary-row">
              <MarketingCardIcon variant="question" />
              <span>Apakah saya bisa cek kurs tanpa login?</span>
            </summary>
            <p>Ya. Anda bisa cek estimasi transfer lebih dulu sebelum memutuskan untuk masuk atau membuat akun.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-summary-row">
              <MarketingCardIcon variant="question" />
              <span>Kapan saya perlu membuat akun?</span>
            </summary>
            <p>Buat akun saat Anda sudah siap lanjut ke transfer, verifikasi, unggah bukti pembayaran, dan cek status.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-summary-row">
              <MarketingCardIcon variant="question" />
              <span>Apakah biaya dan dana diterima bisa dilihat lebih awal?</span>
            </summary>
            <p>Ya. Simulasi publik langsung menampilkan FX, fee, total bayar, dan estimasi dana yang diterima.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-summary-row">
              <MarketingCardIcon variant="question" />
              <span>Metode penerimaan apa saja yang didukung?</span>
            </summary>
            <p>Anda bisa memilih rekening bank, cash pickup, atau mobile wallet sesuai kebutuhan penerima.</p>
          </details>
        </div>
      </section>

    </div>
  );
}

export default PublicMarketingSections;
