'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { SubmitButtonProps } from '@/types/form'
import { IconButtonProps } from '@/types/button-action'
import { SignInButton } from '@clerk/nextjs'
import { FaRegHeart, FaHeart } from 'react-icons/fa'
import { LuTrash2 } from 'react-icons/lu'
import { FiEdit2 } from 'react-icons/fi'
import { GiFalloutShelter } from 'react-icons/gi'

export function SubmitButton({
  className = '',
  text = 'submit',
  size = 'lg',
  disabled = false,
  loadingText = 'Waiting...',
  onClick = () => {},
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn('capitalize', className)}
      size={size}
      onClick={onClick}
    >
      {pending ? (
        <>
          <GiFalloutShelter className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  )
}

export function IconButton({ actionType }: IconButtonProps) {
  const { pending } = useFormStatus()

  const renderIcon = () => {
    switch (actionType) {
      case 'edit':
        return <FiEdit2 />
      case 'delete':
        return <LuTrash2 />
      default:
        const never: never = actionType
        throw new Error(`Invalid action type: ${never}`)
    }
  }

  return (
    <Button type="submit" size="icon" variant="link" className="p-2 cursor-pointer">
      {pending ? <GiFalloutShelter className="animate-spin" /> : renderIcon()}
    </Button>
  )
}

export function CardSignInButton() {
  return (
    <SignInButton mode="modal">
      <Button type="button" size="icon" variant="outline" className="p-2 cursor-pointer" asChild>
        <FaRegHeart />
      </Button>
    </SignInButton>
  )
}

export function CardSubmitButton({ isFavorite }: { isFavorite: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="icon" variant="outline" className="p-2 cursor-pointer">
      {pending ? (
        <GiFalloutShelter className="animate-spin" />
      ) : isFavorite ? (
        <FaHeart />
      ) : (
        <FaRegHeart />
      )}
    </Button>
  )
}

export function ProductSignInButton() {
  return (
    <SignInButton mode="modal">
      <Button type="button" className="mt-8 capitalize text-3xl">
        sign in
      </Button>
    </SignInButton>
  )
}
