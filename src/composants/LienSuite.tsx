import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

interface Props {
  to: LinkProps['to']
  state?: unknown
  className?: string
  children: ReactNode
}

// Un lien discret qui ouvre un autre écran : « Chapelet ou Rosaire ? › ».
// Le chevron, collé au dernier mot par une espace insécable, ne se lit pas :
// le lecteur d'écran n'entend que le nom du lien.
export function LienSuite({ to, state, className, children }: Props) {
  return (
    <Link
      className={className ? `lien-discret ${className}` : 'lien-discret'}
      to={to}
      state={state}
    >
      {children}
      <span aria-hidden="true">{'\u00a0›'}</span>
    </Link>
  )
}
