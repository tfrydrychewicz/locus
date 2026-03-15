/**
 * Show a confirmation dialog. Uses Tauri's native dialog when available,
 * falls back to window.confirm otherwise (e.g. in browser dev or when plugin fails).
 */
export async function confirmAction(
  message: string,
  options?: { title?: string; okLabel?: string; cancelLabel?: string },
): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const hasTauri = typeof (window as unknown as { __TAURI__?: unknown }).__TAURI__ !== 'undefined'
  if (hasTauri) {
    try {
      const { confirm } = await import('@tauri-apps/plugin-dialog')
      return await confirm(message, {
        kind: 'warning',
        title: options?.title,
        okLabel: options?.okLabel,
        cancelLabel: options?.cancelLabel,
      })
    } catch (err) {
      console.warn('Tauri confirm failed, using window.confirm:', err)
    }
  }
  return window.confirm(message)
}
