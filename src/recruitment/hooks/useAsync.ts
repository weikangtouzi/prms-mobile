import { useEffect } from 'react'
import useAsyncFn, { FunctionReturningPromise, PromiseType } from './useAsyncFn'

export default function useAsync<T extends FunctionReturningPromise>(
  fn: T,
  initialValue?: PromiseType<ReturnType<T>>,
) {
  const [state, callback] = useAsyncFn(fn, {
    loading: true,
    value: initialValue,
  })

  useEffect(() => {
    callback()
  }, [callback])

  return state
}
