import hcbLogo from '@/assets/hcb-logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

const Logo = ({ className = "", size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 sm:w-10 sm:h-10",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-12 h-12 sm:w-16 sm:h-16",
    hero: "w-[75%] h-[75%]"
  };

  return (
    <img 
      src={hcbLogo} 
      alt="HCB Ar Condicionado Automotivo" 
      className={`object-contain drop-shadow-[0_0_8px_rgba(0,102,204,0.3)] ${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
