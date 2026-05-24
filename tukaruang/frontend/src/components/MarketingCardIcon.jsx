import PropTypes from "prop-types";

function MarketingCardIcon({ variant }) {
  const icons = {
    clarity: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 12H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    shield: (
      <>
        <path
          d="M12 4L18.5 6.8V11.5C18.5 15.8 16.2 19.3 12 21C7.8 19.3 5.5 15.8 5.5 11.5V6.8L12 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.5 12.2L11.2 13.9L14.8 10.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    flexible: (
      <>
        <circle cx="7.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.5" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.8 10.9L14.1 8.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9.8 13.1L14.1 15.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    tracking: (
      <>
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8V12L14.7 14.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    route: (
      <>
        <circle cx="7" cy="16" r="2.4" fill="currentColor" />
        <circle cx="17" cy="8" r="2.4" fill="currentColor" />
        <path d="M8.9 15C10.8 12.9 12.5 11.6 14.6 10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6.6 18.2C7.9 15.8 9.7 14.8 12 14.8C14.3 14.8 16.1 15.8 17.4 18.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    verify: (
      <>
        <rect x="5.3" y="5.3" width="13.4" height="13.4" rx="3.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.8 12.3L11.1 14.6L15.4 10.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    secure: (
      <>
        <rect x="6" y="10" width="12" height="9" rx="2.8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 10V8.8C8.5 6.9 10 5.4 12 5.4C14 5.4 15.5 6.9 15.5 8.8V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    question: (
      <>
        <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.9 9.7C10.2 8.6 11.1 7.8 12.3 7.8C13.7 7.8 14.7 8.7 14.7 10C14.7 11 14.1 11.6 13.1 12.2C12.4 12.6 12 13 12 13.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="16.9" r="1" fill="currentColor" />
      </>
    ),
  };

  return (
    <span className={`marketing-card-icon marketing-card-icon-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        {icons[variant] || icons.clarity}
      </svg>
    </span>
  );
}

MarketingCardIcon.propTypes = {
  variant: PropTypes.oneOf([
    "account",
    "clarity",
    "flexible",
    "route",
    "question",
    "secure",
    "shield",
    "tracking",
    "verify",
  ]).isRequired,
};

export default MarketingCardIcon;
