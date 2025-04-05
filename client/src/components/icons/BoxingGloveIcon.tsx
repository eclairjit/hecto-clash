import React from 'react';

interface BoxingGloveIconProps {
  color?: string;
  size?: number;
}

const BoxingGloveIcon: React.FC<BoxingGloveIconProps> = ({ 
  color = 'currentColor',
  size = 24
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.5 9.5C15.5 11.5 14.5 13 14.5 14C14.5 15 15 15.5 15 16.5C15 17.5 14.5 18 14 18.5C13.5 19 12 20 10 19.5C8 19 7 18 6.5 17C6 16 6 15 6.5 14C7 13 8 12 8 10.5C8 9 7.5 7.5 8 6.5C8.5 5.5 9.5 4.5 11 4.5C12.5 4.5 15.5 7.5 15.5 9.5Z"
        fill={color}
        stroke={color === 'currentColor' ? color : '#000'}
        strokeWidth="1"
      />
      <path
        d="M10.8327 4.5C10.3327 3.16667 8.42725 0.5 5.5 0.5C2.5 0.5 1 2 0.5 3.5C0 5 0.5 6.5 1.5 7C2.5 7.5 4 7.5 5 7C6 6.5 7 5.5 7.5 4.5"
        stroke={color === 'currentColor' ? color : '#000'}
        strokeWidth="1"
      />
    </svg>
  );
};

export default BoxingGloveIcon; 