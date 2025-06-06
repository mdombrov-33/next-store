import { useEffect, useRef, useState } from "react";
import { TerminalIntroProps } from "@/types/profile";
import { TypeAnimation } from "react-type-animation";
import { hackingScrollSrc } from "@/data/sounds/hacking-sounds";

const MAX_ATTEMPTS = 5;

const TerminalIntro = ({ attemptsLeft }: TerminalIntroProps) => {
  const [animationDone, setAnimationDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const blocks = Array.from({ length: MAX_ATTEMPTS }, (_, i) =>
    i < attemptsLeft ? "▮" : "▯"
  ).join(" ");

  useEffect(() => {
    if (!animationDone) {
      const randomIndex = Math.floor(Math.random() * hackingScrollSrc.length);
      const soundSrc = hackingScrollSrc[randomIndex];

      if (!audioRef.current) {
        audioRef.current = new Audio(soundSrc);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2;
      } else {
        if (audioRef.current.src !== window.location.origin + soundSrc) {
          audioRef.current.src = soundSrc;
        }
      }

      audioRef.current.play().catch((e) => {
        console.log("Audio play failed:", e);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [animationDone]);

  return (
    <section
      aria-label="Terminal introduction"
      className="text-primary text-sm sm:text-xl font-mono space-y-1 bg-black p-4 rounded"
    >
      <h1 className="sr-only">Terminal Intro</h1>

      {!animationDone ? (
        <TypeAnimation
          sequence={[
            "ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL\n",
            0,
            "ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL\nWELCOME TO ROBCO INDUSTRIES (TM)\n",
            0,
            "ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL\nWELCOME TO ROBCO INDUSTRIES (TM)\nPASSWORD REQUIRED\n",
            0,
            `ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL\nWELCOME TO ROBCO INDUSTRIES (TM)\nPASSWORD REQUIRED\nATTEMPTS REMAINING: ${blocks}`,
            () => {
              setAnimationDone(true);
            },
          ]}
          repeat={0}
          speed={95}
          cursor={false}
          className="whitespace-pre-wrap"
        />
      ) : (
        <pre className="whitespace-pre-wrap">
          ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL
          {"\n"}WELCOME TO ROBCO INDUSTRIES (TM)
          {"\n"}PASSWORD REQUIRED
          {"\n"}ATTEMPTS REMAINING: {blocks}
        </pre>
      )}
    </section>
  );
};

export default TerminalIntro;
