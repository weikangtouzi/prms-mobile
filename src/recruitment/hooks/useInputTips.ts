import { useCallback, useMemo } from 'react'
import GeoLocationManager from '../../bridge/geolocation'
import useAsync from './useAsync'
import throttle from 'lodash.throttle'

export function useInputTips(key: string, city?: string) {
  const throttleGetInputTips = useMemo(
    () => throttle(GeoLocationManager.getInputTips, 500),
    [],
  )

  const { value: poiItems } = useAsync(
    useCallback(async () => {
      if (key && city) {
        return throttleGetInputTips(key, city)
      }
    }, [key, city]),
  )

  return poiItems
}
