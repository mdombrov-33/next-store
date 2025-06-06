import { SpecialRegisterHeaderProps } from "@/types/profile";
import { TypeAnimation } from "react-type-animation";

function SpecialRegisterHeader({
  remainingPoints,
}: SpecialRegisterHeaderProps) {
  return (
    <div
      className="flex flex-col items-center text-center gap-2 px-4"
      role="region"
      aria-labelledby="remaining-points-label points-available-label"
    >
      <TypeAnimation
        sequence={["welcome to your S.P.E.C.I.A.L. profile", 2000]}
        wrapper="h1"
        speed={80}
        repeat={0}
        className="md:text-5xl text-3xl -mt-6 capitalize"
        cursor={false}
      />

      <TypeAnimation
        sequence={[
          2000, //* wait for h1 to finish (match timing)
          "Out here, everyone plays a part. Set your S.P.E.C.I.A.L. stats to unlock the G.O.A.T. Test and find your place in Vault 66’s trading network",
        ]}
        wrapper="p"
        speed={80}
        repeat={0}
        className="text-base text-muted-foreground sm:text-lg md:text-xl lg:text-lg max-w-xl mt-2"
      />

      <p className="text-8xl" id="remaining-points-label">
        {remainingPoints}
      </p>

      <p
        className="text-2xl uppercase text-muted-foreground"
        id="points-available-label"
      >
        points available
      </p>
    </div>
  );
}

export default SpecialRegisterHeader;
