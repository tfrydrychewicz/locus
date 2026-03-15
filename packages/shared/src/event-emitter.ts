type EventMap = Record<string, unknown[]>
type Listener<Args extends unknown[]> = (...args: Args) => void

type AnyListener = (...args: unknown[]) => void

export interface TypedEventEmitter<Events extends EventMap> {
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void
  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void
  emit<K extends keyof Events>(event: K, ...args: Events[K]): void
  removeAllListeners(event?: keyof Events): void
}

export function createEventEmitter<Events extends EventMap>(): TypedEventEmitter<Events> {
  const listeners = new Map<keyof Events, Set<AnyListener>>()

  return {
    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set())
      }
      listeners.get(event)?.add(listener as AnyListener)

      return () => {
        listeners.get(event)?.delete(listener as AnyListener)
      }
    },

    off<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
      listeners.get(event)?.delete(listener as AnyListener)
    },

    emit<K extends keyof Events>(event: K, ...args: Events[K]) {
      for (const listener of listeners.get(event) ?? []) {
        ;(listener as Listener<Events[K]>)(...args)
      }
    },

    removeAllListeners(event?: keyof Events) {
      if (event) {
        listeners.delete(event)
      } else {
        listeners.clear()
      }
    },
  }
}
