import classNames from 'classnames'
import type { HTMLAttributes } from 'react'

export type Space = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
export type Tone = 'normal' | 'secondary' | 'danger'
export type AlertTone = 'info' | 'positive' | 'caution' | 'critical'

type ClassValue = Parameters<typeof classNames>[number]

export type WithEnhancedClassName<T = unknown> = T extends HTMLElement
    ? Omit<HTMLAttributes<T>, 'className'> & { className?: ClassValue }
    : T extends { className?: unknown }
    ? Omit<T, 'className'> & { className?: ClassValue }
    : T & { className?: ClassValue }

export interface OpenInNewTab {
    openInNewTab?: boolean
    target?: never
    rel?: never
}