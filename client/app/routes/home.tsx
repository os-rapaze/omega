import { AccretionShaders } from "~/components/ui/io/accretion-shaders";
export default function AccretionShadersDemo() {
  return (
    <AccretionShaders
      speed={0.2}
      turbulence={0.2}
      depth={0.1}
      brightness={0.2}
      colorShift={4}
      className="h-screen w-full"
    />
  );
}
