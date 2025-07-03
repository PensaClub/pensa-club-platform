export const CopyIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <polygon points="19 6 19 17 9 17 9 3 16 3 19 6" fill="rgb(44, 169, 188)" strokeWidth="2"/>
    <path d="M5,6V20a1,1,0,0,0,1,1H16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
    <polygon points="19 6 19 17 9 17 9 3 16 3 19 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
  </svg>
);