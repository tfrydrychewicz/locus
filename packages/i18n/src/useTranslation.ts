import { useTranslation as useI18nextTranslation } from 'react-i18next'
import type { Namespace } from './types.js'

export function useTranslation<N extends Namespace = 'common'>(ns?: N) {
  return useI18nextTranslation(ns)
}
