import PropTypes from "prop-types";
import { getStatusLabel, getStatusTone } from "../utils/status";

function StatusBadge({ value, label, className }) {
  const tone = getStatusTone(value || label);
  const text = label || getStatusLabel(value);

  return (
    <span className={`status-badge-chip status-badge-chip-${tone} ${className}`.trim()}>
      <span className="status-badge-dot" aria-hidden="true" />
      {text}
    </span>
  );
}

StatusBadge.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
};

StatusBadge.defaultProps = {
  value: "",
  label: "",
  className: "",
};

export default StatusBadge;
