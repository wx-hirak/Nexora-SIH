import React from "react";
import { Logo } from "@/components/common/Logo";

export interface AuthHeaderProps {
  subtitle?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  subtitle = "Logistics Operations & Transit Coordination"
}) => {
  return (
    <div className="flex flex-col items-center text-center gap-2 mb-6">
      <Logo size={40} />
      <p className="text-xs text-slate-500 font-medium tracking-wide max-w-xs">{subtitle}</p>
    </div>
  );
};
