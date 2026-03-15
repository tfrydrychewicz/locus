import { describe, expect, it, vi } from 'vitest'
import { createEventEmitter } from './event-emitter.js'

type TestEvents = {
  click: [x: number, y: number]
  message: [text: string]
  empty: []
}

describe('createEventEmitter', () => {
  it('emits events to listeners', () => {
    const emitter = createEventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('click', handler)
    emitter.emit('click', 10, 20)

    expect(handler).toHaveBeenCalledWith(10, 20)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('supports multiple listeners on the same event', () => {
    const emitter = createEventEmitter<TestEvents>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('message', handler1)
    emitter.on('message', handler2)
    emitter.emit('message', 'hello')

    expect(handler1).toHaveBeenCalledWith('hello')
    expect(handler2).toHaveBeenCalledWith('hello')
  })

  it('supports events with no arguments', () => {
    const emitter = createEventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('empty', handler)
    emitter.emit('empty')

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call removed listeners', () => {
    const emitter = createEventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('click', handler)
    emitter.off('click', handler)
    emitter.emit('click', 1, 2)

    expect(handler).not.toHaveBeenCalled()
  })

  it('on() returns an unsubscribe function', () => {
    const emitter = createEventEmitter<TestEvents>()
    const handler = vi.fn()

    const unsub = emitter.on('message', handler)
    emitter.emit('message', 'first')
    expect(handler).toHaveBeenCalledTimes(1)

    unsub()
    emitter.emit('message', 'second')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not error when emitting without listeners', () => {
    const emitter = createEventEmitter<TestEvents>()
    expect(() => emitter.emit('click', 0, 0)).not.toThrow()
  })

  it('removeAllListeners clears a specific event', () => {
    const emitter = createEventEmitter<TestEvents>()
    const clickHandler = vi.fn()
    const msgHandler = vi.fn()

    emitter.on('click', clickHandler)
    emitter.on('message', msgHandler)
    emitter.removeAllListeners('click')

    emitter.emit('click', 1, 2)
    emitter.emit('message', 'hi')

    expect(clickHandler).not.toHaveBeenCalled()
    expect(msgHandler).toHaveBeenCalledWith('hi')
  })

  it('removeAllListeners with no args clears all events', () => {
    const emitter = createEventEmitter<TestEvents>()
    const clickHandler = vi.fn()
    const msgHandler = vi.fn()

    emitter.on('click', clickHandler)
    emitter.on('message', msgHandler)
    emitter.removeAllListeners()

    emitter.emit('click', 1, 2)
    emitter.emit('message', 'hi')

    expect(clickHandler).not.toHaveBeenCalled()
    expect(msgHandler).not.toHaveBeenCalled()
  })

  it('same listener can be added only once per event', () => {
    const emitter = createEventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('message', handler)
    emitter.on('message', handler)
    emitter.emit('message', 'hello')

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
