// Hand-authored Heroicons / Lucide style SVGs (24x24, stroke=currentColor, strokeWidth=1.75)
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

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

export function TrendingUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

export function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M12 2l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z" />
      <path d="M19 16l1.2 2.5 2.5 1.2-2.5 1.2-1.2 2.5-1.2-2.5-2.5-1.2 2.5-1.2z" />
    </svg>
  )
}

export function FileTextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

export function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function AwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  )
}

export function ZapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function Edit3Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export function CalculatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} className="icon" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="18" />
      <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
    </svg>
  )
}
