import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import TukarUangLogo from "./TukarUangLogo";

function WorkspaceShell({
  user,
  title,
  subtitle,
  headerBadge,
  headerTheme,
  headerAction,
  onGoHome,
  onLogout,
  navItems,
  children,
}) {
  return (
    <div className="page-shell workspace-shell">
      <section className="workspace-topbar card public-themed-card">
        <div className="workspace-topbar-main">
          <button type="button" className="workspace-home-link" onClick={onGoHome}>
            Kembali ke beranda
          </button>
          <div className="workspace-brand-row">
            <TukarUangLogo compact showTagline={false} />
            <div className="workspace-user-meta">
              <strong className="type-title tone-primary">{user?.fullName || "Pengguna"}</strong>
              <span className="type-body-sm tone-muted">{user?.email || "Akun aktif"}</span>
            </div>
          </div>
        </div>
        <div className="workspace-topbar-actions">
          <nav className="workspace-nav" aria-label="Navigasi pengguna">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link workspace-nav-link-active" : "workspace-nav-link"
                }
                end={item.end}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="ghost-button workspace-logout-button" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </section>

      <section className={`workspace-page-header workspace-page-header-${headerTheme}`}>
        <div className="workspace-page-header-copy">
          <p className="section-kicker type-caption tone-brand">Area Pengguna</p>
          <h1 className="type-heading-1 tone-primary">{title}</h1>
          {subtitle && <p className="subtitle workspace-page-subtitle type-body tone-secondary">{subtitle}</p>}
        </div>
        <div className="workspace-page-header-actions">
          {headerBadge && <span className="workspace-header-badge">{headerBadge}</span>}
          {headerAction && (
            <Link to={headerAction.to} className="workspace-header-link">
              {headerAction.label}
            </Link>
          )}
        </div>
      </section>

      {children}
    </div>
  );
}

WorkspaceShell.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string,
    email: PropTypes.string,
  }),
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  headerBadge: PropTypes.string,
  headerTheme: PropTypes.oneOf(["dashboard", "compliance", "transfer", "history", "admin"]),
  headerAction: PropTypes.shape({
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
  onGoHome: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      end: PropTypes.bool,
    }),
  ).isRequired,
  children: PropTypes.node.isRequired,
};

WorkspaceShell.defaultProps = {
  user: null,
  subtitle: "",
  headerBadge: "",
  headerTheme: "dashboard",
  headerAction: null,
};

export default WorkspaceShell;
