import hcbLogo from '@/assets/hcb-logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

const Logo = ({ className = "", size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-12 h-12 sm:w-16 sm:h-16",
    hero: "w-[75%] h-[75%] max-w-full"
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <img
        src={hcbLogo}
        alt="HCB Ar Condicionado Automotivo - Peças e Serviços em Castanhal"
        title="HCB Ar Condicionado Automotivo"
        className="w-full h-full object-contain"
        loading={size === 'hero' ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default Logo;