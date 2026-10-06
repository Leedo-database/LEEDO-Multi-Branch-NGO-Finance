import React from 'react';

interface LeedoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'stacked' | 'horizontal' | 'icon-only';
  inverted?: boolean;
}

export const LeedoLogo: React.FC<LeedoLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  inverted = false,
}) => {
  const primaryColor = inverted ? '#FFFFFF' : '#E52229'; // Official LEEDO Red

  const dimensions = {
    sm: { icon: 'w-7 h-9', text: 'text-base', spacing: 'gap-2' },
    md: { icon: 'w-9 h-12', text: 'text-xl', spacing: 'gap-2.5' },
    lg: { icon: 'w-12 h-16', text: 'text-2xl', spacing: 'gap-3' },
    xl: { icon: 'w-16 h-22', text: 'text-4xl', spacing: 'gap-4' },
  }[size];

  // SVG representation of the iconic LEEDO Two Red Joyful Running Children
  const IconSvg = (
    <svg
      viewBox="0 0 746 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${dimensions.icon} flex-shrink-0 transition-transform`}
      aria-label="LEEDO NGO Logo"
    >
      {/* Child 1 (Left): Head */}
      <circle cx="220" cy="135" r="54" fill={primaryColor} />
      
      {/* Child 2 (Right): Head */}
      <circle cx="490" cy="72" r="54" fill={primaryColor} />

      {/* Interlinked Joyful Running Children Bodies and Arms */}
      <path
        d="M200 230 C200 230, 80 320, 25 365 C12 375, 5 390, 15 402 C25 414, 45 415, 65 400 C120 360, 185 305, 230 280 C270 258, 350 230, 420 220 C480 210, 560 170, 680 75 C695 62, 715 65, 725 78 C735 92, 730 110, 712 124 C620 195, 530 255, 470 280 C445 290, 410 330, 395 380 C380 430, 350 490, 400 500 C430 505, 455 450, 485 360 C500 310, 520 280, 540 280 C560 280, 570 300, 565 340 C550 440, 500 535, 550 560 C585 578, 620 530, 645 470 C665 420, 690 380, 715 390 C735 398, 740 420, 725 445 C690 510, 640 600, 570 610 C485 622, 455 540, 430 460 C405 510, 370 560, 330 580 C280 605, 275 560, 280 500 C285 440, 290 380, 245 350 C210 325, 170 345, 150 390 C120 455, 60 560, 45 580 C30 600, 12 590, 18 570 C28 535, 80 440, 120 375 C145 335, 170 280, 200 230 Z"
        fill={primaryColor}
      />

      {/* Legs & Movement Gestures */}
      {/* Left Child Left Leg & Foot */}
      <path
        d="M275 510 C260 580, 220 660, 150 710 C100 745, 40 770, 25 750 C10 730, 20 705, 55 680 C110 640, 150 580, 175 520 Z"
        fill={primaryColor}
      />
      {/* Left Child Right Leg & Foot */}
      <path
        d="M275 550 C290 620, 305 680, 320 735 C328 765, 305 780, 275 780 C240 780, 230 750, 235 720 C245 660, 245 610, 240 560 Z"
        fill={primaryColor}
      />

      {/* Right Child Left Leg & Foot */}
      <path
        d="M480 470 C460 550, 440 630, 410 710 C395 750, 420 770, 455 770 C485 770, 500 740, 505 700 C515 620, 525 560, 530 500 Z"
        fill={primaryColor}
      />
      {/* Right Child Right Leg & Foot (Kicking Backwards in Joy) */}
      <path
        d="M560 550 C585 610, 630 670, 675 705 C705 730, 725 715, 715 685 C700 645, 660 595, 620 540 Z"
        fill={primaryColor}
      />

      {/* Typography: Official Bold LEEDO Text */}
      <text
        x="373"
        y="960"
        textAnchor="middle"
        fill={primaryColor}
        fontSize="175"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="6"
      >
        LEEDO
      </text>
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{IconSvg}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        {IconSvg}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${dimensions.spacing} ${className}`}>
      {IconSvg}
      <div className="flex flex-col text-left">
        <span
          className={`font-black tracking-tight leading-none ${dimensions.text}`}
          style={{ color: primaryColor }}
        >
          LEEDO
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-tight mt-0.5">
          Finance & Accounts
        </span>
      </div>
    </div>
  );
};
