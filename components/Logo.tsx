
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dark Teal Bubble Background - Replicating the user's provided logo shape */}
      <path 
        d="M15 30C15 18.9543 23.9543 10 35 10H75C86.0457 10 95 18.9543 95 30V60C95 71.0457 86.0457 80 75 80H55L45 90V80H35C23.9543 80 15 71.0457 15 60V30Z" 
        fill="#002D2D" 
      />
      {/* White 'P' Character - Stylized cut-out */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M40 25H65C73.2843 25 80 31.7157 80 40C80 48.2843 73.2843 55 65 55H48V70H40V25ZM48 47H65C68.866 47 72 43.866 72 40C72 36.134 68.866 33 65 33H48V47Z" 
        fill="white" 
      />
    </svg>
  );
};
