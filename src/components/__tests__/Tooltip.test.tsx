import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tooltip } from '../Tooltip'

const SHOW_DELAY = 500
const HIDE_DELAY = 100

// Runs the same test abstracting how the tooltip is triggered (can be via mouse or keyboard)
function testShowHide({
    delayedShow,
    triggerShow,
    triggerHide,
}: {
    delayedShow: boolean
    triggerShow: () => void
    triggerHide: () => void
}) {
    triggerShow()

    // tooltip is not immediately visible only when hovering, but shown immediately on focus
    if (delayedShow) {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        // wait a bit
        act(() => {
            jest.advanceTimersByTime(SHOW_DELAY)
        })
    }

    // tooltip is now visible
    expect(screen.getByRole('tooltip', { name: 'tooltip content here' })).toBeInTheDocument()

    triggerHide()

    // tooltip is not immediately removed
    expect(screen.getByRole('tooltip', { name: 'tooltip content here' })).toBeInTheDocument()
    // wait a bit
    act(() => {
        jest.advanceTimersByTime(HIDE_DELAY)
    })
    // tooltip is gone
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
}

describe('Tooltip', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders a tooltip when the button gets focus, hides it when blurred', () => {
        render(
            <Tooltip content="tooltip content here">
                <button>Click me</button>
            </Tooltip>,
        )

        testShowHide({
            delayedShow: false,
            triggerShow() {
                fireEvent.focus(screen.getByRole('button', { name: 'Click me' }))
            },
            triggerHide() {
                fireEvent.blur(screen.getByRole('button', { name: 'Click me' }))
            },
        })
    })

    it('renders a tooltip when the button is hovered, hides it when unhovered', () => {
        render(
            <Tooltip content="tooltip content here">
                <button>Click me</button>
            </Tooltip>,
        )
        testShowHide({
            delayedShow: true,
            triggerShow() {
                fireEvent.mouseOver(screen.getByRole('button', { name: 'Click me' }))
            },
            triggerHide() {
                fireEvent.mouseLeave(screen.getByRole('button', { name: 'Click me' }))
            },
        })
    })

    it('does not render a tooltip if the content is empty', () => {
        render(
            <Tooltip content={null}>
                <button>Click me</button>
            </Tooltip>,
        )

        // mouse over and wait more than enough
        fireEvent.mouseOver(screen.getByRole('button', { name: 'Click me' }))
        act(() => {
            jest.advanceTimersByTime(SHOW_DELAY * 2)
        })
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

        // focus on button and wait more than enough
        fireEvent.blur(screen.getByRole('button', { name: 'Click me' }))
        act(() => {
            jest.advanceTimersByTime(SHOW_DELAY * 2)
        })
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('does not render the tooltip markup at all while not shown', () => {
        render(
            <Tooltip content="tooltip content here">
                <button>Click me</button>
            </Tooltip>,
        )
        // queryByText, unlike getByRole, will find an element even if hidden with display: none or
        // by any other means. getByRole on the other hand takes visibility into account.
        expect(screen.queryByText('tooltip content here')).not.toBeInTheDocument()
    })

    it('can render content generated by a function only called when needed', () => {
        const content = jest.fn(() => 'tooltip content generated dynamically')
        render(
            <Tooltip content={content}>
                <button>Click me</button>
            </Tooltip>,
        )

        // assert that content has not been generated internally even, not even after a delay
        act(() => {
            jest.advanceTimersByTime(SHOW_DELAY * 2)
        })
        expect(content).not.toHaveBeenCalled()

        // content is generated when the tooltip is needed to be shown
        fireEvent.mouseOver(screen.getByRole('button', { name: 'Click me' }))
        act(() => {
            jest.advanceTimersByTime(SHOW_DELAY)
        })
        expect(content).toHaveBeenCalled()
    })
})
