import PropTypes from "prop-types";
import CustomerAccessSection from "./CustomerAccessSection";

function AuthPage({
  mode,
  registerForm,
  setRegisterForm,
  loginForm,
  setLoginForm,
  handleRegister,
  handleLogin,
  loading,
  onGoHome,
  onGoToLogin,
  onGoToRegister,
}) {
  return (
    <div className="page-shell auth-page-shell">
      <div className="auth-page-topbar">
        <button type="button" className="auth-back-link" onClick={onGoHome}>
          Kembali ke beranda
        </button>
      </div>

      <CustomerAccessSection
        mode={mode}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleRegister={handleRegister}
        handleLogin={handleLogin}
        loading={loading}
        onGoToLogin={onGoToLogin}
        onGoToRegister={onGoToRegister}
      />
    </div>
  );
}

AuthPage.propTypes = {
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
  onGoHome: PropTypes.func.isRequired,
  onGoToLogin: PropTypes.func.isRequired,
  onGoToRegister: PropTypes.func.isRequired,
};

export default AuthPage;
