import type { LucideIcon, LucideProps } from 'lucide-react'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon
  size?: number
  className?: string
}

export function Icon({ icon: LucideIcon, size = 16, className = '', ...rest }: IconProps) {
  return <LucideIcon size={size} className={className} aria-hidden="true" {...rest} />
}
