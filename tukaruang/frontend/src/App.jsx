import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import AuthPage from "./components/AuthPage";
import CustomerWorkflowSection from "./components/CustomerWorkflowSection";
import DashboardOverview from "./components/DashboardOverview";
import DashboardHero from "./components/DashboardHero";
import PublicMarketingSections from "./components/PublicMarketingSections";
import QuoteStatusSection from "./components/QuoteStatusSection";
import TransfersTable from "./components/TransfersTable";
import WorkspaceShell from "./components/WorkspaceShell";
import { api, setApiToken } from "./services/api";
import "./App.css";

const defaultRegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
};

const defaultLoginForm = {
  email: "",
  password: "",
};

const defaultQuoteForm = {
  from: "QAR",
  to: "IDR",
  amount: 5000,
};

const defaultKycForm = {
  fullName: "",
  phone: "",
  dateOfBirth: "",
  nationality: "Indonesia",
  address: "",
  city: "",
  country: "Indonesia",
  occupation: "",
  identityType: "KTP",
  identityNumber: "",
  npwp: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  livenessConsent: true,
  notes: "",
};

const defaultTransferForm = {
  fromCurrency: "QAR",
  toCurrency: "IDR",
  amount: 5000,
  recipientName: "",
  recipientPhone: "",
  recipientCountry: "Indonesia",
  recipientBank: "",
  recipientAccountNumber: "",
  payoutMethod: "bank_transfer",
  purpose: "Family Support",
};

const defaultAdminFilters = {
  userKeyword: "",
  userKycStatus: "pending_review",
  transferKeyword: "",
  transferStatus: "",
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("tukaruang_token") || "");
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [kycStatus, setKycStatus] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [quote, setQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState(defaultQuoteForm);
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
  const [loginForm, setLoginForm] = useState(defaultLoginForm);
  const [kycForm, setKycForm] = useState(defaultKycForm);
  const [transferForm, setTransferForm] = useState(defaultTransferForm);
  const [selfieDataUrl, setSelfieDataUrl] = useState("");
  const [identityDocument, setIdentityDocument] = useState(null);
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTransfers, setAdminTransfers] = useState([]);
  const [adminFilters, setAdminFilters] = useState(defaultAdminFilters);
  const [reviewForm, setReviewForm] = useState({});
  const [transferUpdateForm, setTransferUpdateForm] = useState({});
  const [paymentProofFiles, setPaymentProofFiles] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = ["admin", "compliance"].includes(user?.role || "");
  const showNotice = useCallback((message, type = "info", title = "") => {
    setNotice({
      id: Date.now(),
      message,
      type,
      title,
    });
  }, []);
  const clearNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const handleApiError = useCallback((error) => {
    const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg;

    if (message) {
      showNotice(message, "error", "Terjadi Masalah");
      return;
    }

    if (error.code === "ERR_NETWORK") {
      showNotice(
        "Koneksi ke server gagal. Jika ini terjadi saat upload KYC, coba ulangi beberapa detik lagi setelah backend selesai menyimpan folder upload.",
        "error",
        "Koneksi Gagal",
      );
      return;
    }

    showNotice(error.message || "Terjadi kesalahan.", "error", "Terjadi Masalah");
  }, [showNotice]);

  const fetchCurrencies = useCallback(async (search = "") => {
    const response = await api.get("/rates/currencies", { params: { search } });
    setCurrencies(response.data.results || []);
  }, []);

  const fetchAdminData = useCallback(async () => {
    const [adminSummaryResponse, adminUsersResponse, adminTransfersResponse] =
      await Promise.all([
        api.get("/admin/summary"),
        api.get("/admin/users", {
          params: {
            kycStatus: adminFilters.userKycStatus,
            keyword: adminFilters.userKeyword,
          },
        }),
        api.get("/admin/transfers", {
          params: {
            status: adminFilters.transferStatus,
            keyword: adminFilters.transferKeyword,
          },
        }),
      ]);

    setAdminSummary(adminSummaryResponse.data.summary || null);
    setAdminUsers(adminUsersResponse.data.users || []);
    setAdminTransfers(adminTransfersResponse.data.transfers || []);
  }, [adminFilters]);

  const fetchProtectedData = useCallback(async () => {
    if (!localStorage.getItem("tukaruang_token")) {
      return;
    }

    try {
      const [meResponse, summaryResponse, transferResponse, kycResponse] =
        await Promise.all([
          api.get("/auth/me"),
          api.get("/dashboard/summary"),
          api.get("/transfers"),
          api.get("/kyc/status"),
        ]);

      setUser(meResponse.data.user);
      setSummary(summaryResponse.data.summary);
      setTransfers(transferResponse.data.transfers || []);
      setKycStatus(kycResponse.data.kyc || null);
      setKycForm((current) => ({
        ...current,
        fullName: meResponse.data.user.fullName || current.fullName,
        phone: meResponse.data.user.phone || current.phone,
        dateOfBirth: meResponse.data.user.profile?.dateOfBirth || current.dateOfBirth,
        nationality: meResponse.data.user.profile?.nationality || current.nationality,
        address: meResponse.data.user.profile?.address || current.address,
        city: meResponse.data.user.profile?.city || current.city,
        country: meResponse.data.user.profile?.country || current.country,
        occupation: meResponse.data.user.profile?.occupation || current.occupation,
        identityType: meResponse.data.user.profile?.identityType || current.identityType,
        identityNumber:
          meResponse.data.user.profile?.identityNumber || current.identityNumber,
        npwp: meResponse.data.user.profile?.npwp || current.npwp,
        emergencyContactName:
          meResponse.data.user.profile?.emergencyContactName ||
          current.emergencyContactName,
        emergencyContactPhone:
          meResponse.data.user.profile?.emergencyContactPhone ||
          current.emergencyContactPhone,
      }));
      setSelfieDataUrl(meResponse.data.user.kyc?.selfieDataUrl || "");
      if (["admin", "compliance"].includes(meResponse.data.user.role || "")) {
        await fetchAdminData();
      } else {
        setAdminSummary(null);
        setAdminUsers([]);
        setAdminTransfers([]);
      }
    } catch (error) {
      localStorage.removeItem("tukaruang_token");
      setApiToken("");
      setToken("");
      setUser(null);
      setAdminSummary(null);
      setAdminUsers([]);
      setAdminTransfers([]);
    }
  }, [fetchAdminData]);

  useEffect(() => {
    fetchCurrencies().catch(() => undefined);
  }, [fetchCurrencies]);

  useEffect(() => {
    if (!token) {
      return;
    }

    setApiToken(token);
    fetchProtectedData();
  }, [fetchProtectedData, token]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }

    fetchAdminData().catch(() => undefined);
  }, [fetchAdminData, isAdmin, isAuthenticated]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => {
      clearNotice();
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [clearNotice, notice]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setShowBackToTop(false);
      return;
    }

    const handleWindowScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };

    handleWindowScroll();
    window.addEventListener("scroll", handleWindowScroll);

    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      return undefined;
    }

    const elements = document.querySelectorAll(
      ".hero-grid .card, .public-zone > .section-heading-block, .public-zone .card",
    );

    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 260)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
        element.classList.remove("scroll-reveal", "is-visible");
        element.style.removeProperty("--reveal-delay");
      });
      observer.disconnect();
    };
  }, [location.pathname]);

  const handleQuote = useCallback(async () => {
    setLoading(true);
    clearNotice();

    try {
      const response = await api.get("/rates/latest", {
        params: {
          from: quoteForm.from,
          to: quoteForm.to,
          amount: quoteForm.amount,
        },
      });

      setQuote(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [clearNotice, handleApiError, quoteForm.amount, quoteForm.from, quoteForm.to]);

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    if (!quoteForm.amount || Number(quoteForm.amount) <= 0) {
      setQuote(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      handleQuote().catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [handleQuote, location.pathname, quoteForm.amount, quoteForm.from, quoteForm.to]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace("#", "");
    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  const handleRegister = async (event, redirectTo = "/dashboard") => {
    event.preventDefault();
    setLoading(true);
    clearNotice();

    try {
      const response = await api.post("/auth/register", registerForm);
      const authToken = response.data.token;
      setApiToken(authToken);
      localStorage.setItem("tukaruang_token", authToken);
      setToken(authToken);
      setUser(response.data.user);
      setRegisterForm(defaultRegisterForm);
      showNotice("Pendaftaran berhasil. Akun siap digunakan.", "success", "Pendaftaran Berhasil");
      await fetchProtectedData();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event, redirectTo = "/dashboard") => {
    event.preventDefault();
    setLoading(true);
    clearNotice();

    try {
      const response = await api.post("/auth/login", loginForm);
      const authToken = response.data.token;
      setApiToken(authToken);
      localStorage.setItem("tukaruang_token", authToken);
      setToken(authToken);
      setUser(response.data.user);
      setLoginForm(defaultLoginForm);
      showNotice("Login berhasil.", "success", "Login Berhasil");
      await fetchProtectedData();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setApiToken("");
    localStorage.removeItem("tukaruang_token");
    setToken("");
    setUser(null);
    setSummary(null);
    setTransfers([]);
    setKycStatus(null);
    setAdminSummary(null);
    setAdminUsers([]);
    setAdminTransfers([]);
    setReviewForm({});
    setTransferUpdateForm({});
    showNotice("Anda sudah logout.", "info", "Sampai Jumpa");
    navigate("/", { replace: true });
  };

  const handleKycSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      showNotice("Login terlebih dahulu untuk mengirim KYC.", "info", "Akses Diperlukan");
      return;
    }

    setLoading(true);
    clearNotice();

    try {
      const formData = new FormData();
      Object.entries(kycForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("selfieDataUrl", selfieDataUrl);

      if (identityDocument) {
        formData.append("identityDocument", identityDocument);
      }

      if (supportingDocument) {
        formData.append("supportingDocument", supportingDocument);
      }

      await api.post("/kyc/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showNotice("KYC berhasil dikirim. Status menunggu review.", "success", "KYC Terkirim");
      await fetchProtectedData();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      showNotice("Login terlebih dahulu untuk membuat transfer.", "info", "Akses Diperlukan");
      return;
    }

    setLoading(true);
    clearNotice();

    try {
      await api.post("/transfers", transferForm);
      showNotice(
        "Transfer berhasil dibuat. Lanjutkan cek status dan unggah bukti pembayaran dari halaman riwayat.",
        "success",
        "Transfer Berhasil",
      );
      setTransferForm(defaultTransferForm);
      await fetchProtectedData();
      navigate("/history");
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentProofUpload = async (transferId) => {
    const paymentProofFile = paymentProofFiles[transferId];

    if (!paymentProofFile) {
      showNotice("Pilih file bukti pembayaran terlebih dahulu.", "info", "File Dibutuhkan");
      return;
    }

    setLoading(true);
    clearNotice();

    try {
      const formData = new FormData();
      formData.append("paymentProof", paymentProofFile);

      await api.post(`/transfers/${transferId}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showNotice("Bukti pembayaran berhasil diunggah.", "success", "Upload Berhasil");
      setPaymentProofFiles((current) => {
        const next = { ...current };
        delete next[transferId];
        return next;
      });

      await fetchProtectedData();
      if (isAdmin) {
        await fetchAdminData();
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminKycReview = async (userId) => {
    const currentReview = reviewForm[userId] || {
      status: "approved",
      notes: "",
    };

    setLoading(true);
    clearNotice();

    try {
      await api.patch(`/admin/users/${userId}/kyc`, currentReview);
      showNotice("Review KYC berhasil disimpan.", "success", "Review Disimpan");
      await Promise.all([fetchProtectedData(), fetchAdminData()]);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminTransferUpdate = async (transferId) => {
    const currentUpdate = transferUpdateForm[transferId] || {
      status: "processing",
      statusNotes: "",
    };

    setLoading(true);
    clearNotice();

    try {
      await api.patch(`/admin/transfers/${transferId}/status`, currentUpdate);
      showNotice("Status transfer berhasil diperbarui.", "success", "Status Diperbarui");
      await Promise.all([fetchProtectedData(), fetchAdminData()]);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId) => () => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const buildAuthRoute = (basePath, redirectTo = "/dashboard") =>
    `${basePath}?redirect=${encodeURIComponent(redirectTo)}`;
  const getRedirectTarget = () =>
    new URLSearchParams(location.search).get("redirect") || "/dashboard";

  const goToHome = () => navigate("/");
  const goToDashboard = () => navigate("/dashboard");
  const goToLogin = (redirectTo = "/dashboard") =>
    navigate(buildAuthRoute("/login", redirectTo));
  const goToRegister = (redirectTo = "/dashboard") =>
    navigate(buildAuthRoute("/register", redirectTo));

  const authRedirectTarget = getRedirectTarget();
  const workspaceNavItems = [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/compliance", label: "Kepatuhan" },
    { to: "/transfer", label: "Transfer" },
    { to: "/history", label: "Riwayat" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const homePage = (
    <div className="page-shell" id="page-top">
      <DashboardHero
        isAuthenticated={isAuthenticated}
        user={user}
        summary={summary}
        onLogout={handleLogout}
        onGoToDashboard={goToDashboard}
        onScrollToQuote={scrollToSection("public-quote")}
        onGoToLogin={() => goToLogin("/dashboard")}
        onGoToRegister={() => goToRegister("/dashboard")}
      />

      <section className="public-zone" id="public-quote">
        <div className="section-heading section-heading-block">
          <div>
            <p className="section-kicker">Beranda Publik</p>
            <h2>Informasi layanan dan simulasi kurs</h2>
            <p className="subtitle">
              Beranda utama fokus pada hal yang paling dibutuhkan pengunjung: gambaran layanan, tujuan populer,
              dan estimasi kurs tanpa detail operasional yang tidak perlu.
            </p>
          </div>
        </div>

        <QuoteStatusSection
          currencies={currencies}
          quoteForm={quoteForm}
          setQuoteForm={setQuoteForm}
          loading={loading}
          quote={quote}
        />

        <PublicMarketingSections />
      </section>

      {showBackToTop && (
        <button type="button" className="floating-top-button" onClick={scrollToTop}>
          Ke Atas
        </button>
      )}
    </div>
  );

  const dashboardPage = (
    <WorkspaceShell
      user={user}
      title="Dashboard Pengguna"
      subtitle="Lihat status akun, cek kesiapan transfer, dan lanjutkan langkah penting berikutnya dari tampilan yang lebih ringkas dan nyaman."
      headerTheme="dashboard"
      headerBadge={kycStatus?.status === "approved" ? "Akun Siap Digunakan" : "Lengkapi KYC Anda"}
      onGoHome={goToHome}
      onLogout={handleLogout}
      navItems={workspaceNavItems}
    >
      <DashboardOverview user={user} summary={summary} kycStatus={kycStatus} />
    </WorkspaceShell>
  );

  const compliancePage = (
    <WorkspaceShell
      user={user}
      title="Kepatuhan Akun"
      subtitle="Lengkapi data, dokumen, dan verifikasi wajah agar akun Anda siap diproses dan lebih cepat digunakan untuk transfer."
      headerTheme="compliance"
      headerBadge={kycStatus?.status === "approved" ? "KYC Disetujui" : "Tahap Verifikasi"}
      headerAction={{ to: "/dashboard", label: "Kembali ke Dashboard" }}
      onGoHome={goToHome}
      onLogout={handleLogout}
      navItems={workspaceNavItems}
    >
      <CustomerWorkflowSection
        kycForm={kycForm}
        setKycForm={setKycForm}
        handleKycSubmit={handleKycSubmit}
        loading={loading}
        isAuthenticated={isAuthenticated}
        kycStatus={kycStatus}
        selfieDataUrl={selfieDataUrl}
        setSelfieDataUrl={setSelfieDataUrl}
        setIdentityDocument={setIdentityDocument}
        setSupportingDocument={setSupportingDocument}
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        handleTransferSubmit={handleTransferSubmit}
        currencies={currencies}
        mode="kyc"
      />
    </WorkspaceShell>
  );

  const transferPage = (
    <WorkspaceShell
      user={user}
      title="Buat Transfer"
      subtitle="Masukkan detail penerima, pilih metode pencairan, dan lanjutkan proses transfer dari halaman yang fokus pada pengiriman."
      headerTheme="transfer"
      headerBadge={kycStatus?.status === "approved" ? "Transfer Aktif" : "Menunggu Persetujuan KYC"}
      headerAction={{ to: "/dashboard", label: "Kembali ke Dashboard" }}
      onGoHome={goToHome}
      onLogout={handleLogout}
      navItems={workspaceNavItems}
    >
      <CustomerWorkflowSection
        kycForm={kycForm}
        setKycForm={setKycForm}
        handleKycSubmit={handleKycSubmit}
        loading={loading}
        isAuthenticated={isAuthenticated}
        kycStatus={kycStatus}
        selfieDataUrl={selfieDataUrl}
        setSelfieDataUrl={setSelfieDataUrl}
        setIdentityDocument={setIdentityDocument}
        setSupportingDocument={setSupportingDocument}
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        handleTransferSubmit={handleTransferSubmit}
        currencies={currencies}
        mode="transfer"
      />
    </WorkspaceShell>
  );

  const historyPage = (
    <WorkspaceShell
      user={user}
      title="Riwayat Transfer"
      subtitle="Pantau status transaksi, lihat bukti pembayaran, dan ikuti perkembangan setiap transfer dari satu tempat yang lebih rapi."
      headerTheme="history"
      headerBadge={transfers.length > 0 ? `${transfers.length} Transfer Tersimpan` : "Belum Ada Transfer"}
      headerAction={{ to: "/dashboard", label: "Kembali ke Dashboard" }}
      onGoHome={goToHome}
      onLogout={handleLogout}
      navItems={workspaceNavItems}
    >
      <TransfersTable
        transfers={transfers}
        paymentProofFiles={paymentProofFiles}
        setPaymentProofFiles={setPaymentProofFiles}
        handlePaymentProofUpload={handlePaymentProofUpload}
        loading={loading}
      />
    </WorkspaceShell>
  );

  const adminPage = (
    <WorkspaceShell
      user={user}
      title="Panel Admin"
      subtitle="Halaman admin dipisahkan agar review KYC dan operasional transfer tidak bercampur dengan alur pengguna biasa."
      headerTheme="admin"
      headerBadge="Akses Operasional"
      onGoHome={goToHome}
      onLogout={handleLogout}
      navItems={workspaceNavItems}
    >
      <AdminPanel
        adminSummary={adminSummary}
        adminUsers={adminUsers}
        adminTransfers={adminTransfers}
        adminFilters={adminFilters}
        setAdminFilters={setAdminFilters}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        transferUpdateForm={transferUpdateForm}
        setTransferUpdateForm={setTransferUpdateForm}
        handleAdminKycReview={handleAdminKycReview}
        handleAdminTransferUpdate={handleAdminTransferUpdate}
        loading={loading}
      />
    </WorkspaceShell>
  );

  const protectedRedirect = buildAuthRoute("/login", `${location.pathname}${location.search || ""}`);

  return (
    <>
      {notice && (
        <div
          className={`toast-notice toast-notice-${notice.type || "info"}`}
          role="status"
          aria-live="polite"
        >
          <div className="toast-notice-body">
            <strong>{notice.title || "Informasi"}</strong>
            <p>{notice.message}</p>
          </div>
          <button type="button" className="toast-close-button" onClick={clearNotice}>
            Tutup
          </button>
        </div>
      )}

      <Routes>
      <Route path="/" element={homePage} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? dashboardPage : <Navigate to={protectedRedirect} replace />}
      />
      <Route
        path="/compliance"
        element={isAuthenticated ? compliancePage : <Navigate to={protectedRedirect} replace />}
      />
      <Route
        path="/transfer"
        element={isAuthenticated ? transferPage : <Navigate to={protectedRedirect} replace />}
      />
      <Route
        path="/history"
        element={isAuthenticated ? historyPage : <Navigate to={protectedRedirect} replace />}
      />
      <Route
        path="/admin"
        element={
          !isAuthenticated ? (
            <Navigate to={protectedRedirect} replace />
          ) : isAdmin ? (
            adminPage
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={authRedirectTarget} replace />
          ) : (
            <AuthPage
              mode="login"
              registerForm={registerForm}
              setRegisterForm={setRegisterForm}
              loginForm={loginForm}
              setLoginForm={setLoginForm}
              handleRegister={(event) => handleRegister(event, authRedirectTarget)}
              handleLogin={(event) => handleLogin(event, authRedirectTarget)}
              loading={loading}
              onGoHome={goToHome}
              onGoToLogin={() => goToLogin(authRedirectTarget)}
              onGoToRegister={() => goToRegister(authRedirectTarget)}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={authRedirectTarget} replace />
          ) : (
            <AuthPage
              mode="register"
              registerForm={registerForm}
              setRegisterForm={setRegisterForm}
              loginForm={loginForm}
              setLoginForm={setLoginForm}
              handleRegister={(event) => handleRegister(event, authRedirectTarget)}
              handleLogin={(event) => handleLogin(event, authRedirectTarget)}
              loading={loading}
              onGoHome={goToHome}
              onGoToLogin={() => goToLogin(authRedirectTarget)}
              onGoToRegister={() => goToRegister(authRedirectTarget)}
            />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
