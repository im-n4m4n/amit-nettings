import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { Bird, Bug, Grid3x3, ShieldCheck } from "@/components/icons";

const MAP: Record<string, ComponentType<IconProps>> = {
  mosquito: Bug,
  bird: Bird,
  grill: Grid3x3,
  shield: ShieldCheck,
};

export function ServiceIcon({
  icon,
  className = "h-6 w-6",
  weight = "duotone",
}: {
  icon: string;
  className?: string;
  weight?: IconProps["weight"];
}) {
  const Component = MAP[icon] ?? ShieldCheck;
  return <Component className={className} weight={weight} />;
}
