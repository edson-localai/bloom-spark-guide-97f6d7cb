import hcbLogo from "@/assets/hcb-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}

const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14 sm:w-16 sm:h-16",
    lg: "w-20 h-20 sm:w-24 sm:h-24",
    hero: "w-[75%] h-[75%] max-w-full",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <img
        src={hcbLogo}
        alt="HCB Ar Condicionado Automotivo - Peças e Serviços em Castanhal"
        title="HCB Ar Condicionado Automotivo"
        className="w-full h-full object-contain"
        loading={size === "hero" ? "eager" : "lazy"}
      />
    </div>
  );
};

export default Logo;
