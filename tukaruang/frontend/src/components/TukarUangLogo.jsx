import PropTypes from "prop-types";

function TukarUangLogo({ compact, light, className, showTagline }) {
  const classes = [
    "tu-logo",
    compact ? "tu-logo-compact" : "",
    light ? "tu-logo-light" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="tu-logo-mark" aria-hidden="true">
        <span className="tu-logo-stroke tu-logo-stroke-top" />
        <span className="tu-logo-stroke tu-logo-stroke-bottom" />
        <span className="tu-logo-center">T</span>
      </div>
      <div className="tu-logo-copy">
        <strong>TUKAR UANG</strong>
        {!compact && showTagline && <span>SMART EXCHANGE FOR EVERYONE</span>}
      </div>
    </div>
  );
}

TukarUangLogo.propTypes = {
  compact: PropTypes.bool,
  light: PropTypes.bool,
  className: PropTypes.string,
  showTagline: PropTypes.bool,
};

TukarUangLogo.defaultProps = {
  compact: false,
  light: false,
  className: "",
  showTagline: true,
};

export default TukarUangLogo;
