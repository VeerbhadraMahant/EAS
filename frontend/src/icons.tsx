// Hand-authored, Heroicons-outline-style SVGs (24x24, stroke=currentColor,
// strokeWidth=1.75). No icon package added — CLAUDE.md: no new dependencies
// without asking, and the user is asleep.

import type { SVGProps } from 'react'

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  )
}

export function XCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  )
}

export function MinusCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12h7" />
    </svg>
  )
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M14.5 6.5L9 12l5.5 5.5" />
    </svg>
  )
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M9.5 6.5L15 12l-5.5 5.5" />
    </svg>
  )
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 20c1.2-3.2 4-5 7-5s5.8 1.8 7 5" />
    </svg>
  )
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M5 5.5C5 4.7 5.7 4 6.5 4H19v14.5c0 .28-.22.5-.5.5H6.5A1.5 1.5 0 005 20.5V5.5z" />
      <path d="M5 17.5c0-.83.67-1.5 1.5-1.5H19" />
    </svg>
  )
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" strokeLinejoin="round" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CloudIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M7 18.5a4 4 0 01-.5-7.97A5.5 5.5 0 0117 9.5a4 4 0 01.5 8H7z" />
    </svg>
  )
}

export function CloudOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M7 18.5a4 4 0 01-.5-7.97A5.5 5.5 0 0117 9.5a4 4 0 01.5 8H10" />
      <path d="M4 4l16 16" />
    </svg>
  )
}

export function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M12 3.5l8 4.5-8 4.5-8-4.5 8-4.5z" strokeLinejoin="round" />
      <path d="M4 12.5l8 4.5 8-4.5" />
      <path d="M4 16.5l8 4.5 8-4.5" />
    </svg>
  )
}
