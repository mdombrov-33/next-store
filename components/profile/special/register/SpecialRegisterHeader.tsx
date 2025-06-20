import { useEffect, useState } from 'react'
import { SpecialRegisterHeaderProps } from '@/types/profile'
import { TypeAnimation } from 'react-type-animation'
import { useSoundPlayer } from '@/hooks/useSoundPlayer'

function SpecialRegisterHeader({ remainingPoints }: SpecialRegisterHeaderProps) {
  const { playTypingLoop, stopTypingLoop } = useSoundPlayer()
  const [animationStage, setAnimationStage] = useState<'none' | 'first' | 'second'>('none')

  useEffect(() => {
    if (animationStage === 'first' || animationStage === 'second') {
      playTypingLoop()
    } else {
      stopTypingLoop()
    }
    return () => {
      stopTypingLoop()
    }
  }, [animationStage, playTypingLoop, stopTypingLoop])

  return (
    <div
      className="flex flex-col items-center text-center gap-2 px-4"
      role="region"
      aria-labelledby="remaining-points-label points-available-label"
    >
      <TypeAnimation
        sequence={[
          () => setAnimationStage('first'), //* animation start callback
          'welcome to your S.P.E.C.I.A.L. profile',
          () => setAnimationStage('second'), //* first animation done
        ]}
        wrapper="h1"
        speed={85}
        repeat={0}
        className="md:text-6xl text-3xl -mt-6 capitalize"
        cursor={false}
      />

      <TypeAnimation
        sequence={[
          () => setAnimationStage('second'), //* second animation start
          0, //* wait for first animation to finish visually
          "Everyone in the wasteland plays a part. Allocate your S.P.E.C.I.A.L. stats to unlock the G.O.A.T. Test and secure your role in Vault 66's trade network.",
          () => setAnimationStage('none'), //* second animation done
        ]}
        wrapper="p"
        speed={80}
        repeat={0}
        className="text-base text-muted-foreground sm:text-lg md:text-xl lg:text-lg max-w-xl mt-2"
      />

      <p className="text-8xl" id="remaining-points-label">
        {remainingPoints}
      </p>

      <p className="text-2xl uppercase text-muted-foreground" id="points-available-label">
        points remaining
      </p>
    </div>
  )
}

export default SpecialRegisterHeader
