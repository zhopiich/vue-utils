import type { MaybeRef, Ref, ShallowRef, UnwrapRef } from 'vue'

export interface UseAsyncStateOptions<T, Shallow extends boolean> {
  immediate?: boolean
  shallow?: Shallow
  resetOnExecute?: boolean
  ignoreOnDispose?: boolean
  onError?: (e: unknown) => void
  onSuccess?: (data: T) => void
}

type State<T, Shallow extends boolean>
  = Shallow extends true ? ShallowRef<T> : Ref<UnwrapRef<T>>

export interface UseAsyncStateReturn<
  T,
  Params extends unknown[] = unknown[],
  Shallow extends boolean = true,
> {
  state: State<T, Shallow>
  isLoading: Ref<boolean>
  isFinished: Ref<boolean>
  error: Ref<unknown>
  execute: (...args: Params) => Promise<T | undefined>
}

export function useAsyncState<
  T,
  Params extends unknown[] = unknown[],
  Shallow extends boolean = true,
>(
  promiseFn: (...args: Params) => Promise<T>,
  initialState: MaybeRef<T>,
  options?: UseAsyncStateOptions<T, Shallow>,
): UseAsyncStateReturn<T, Params, Shallow> {
  const {
    immediate = true,
    shallow = true,
    resetOnExecute = true,
    ignoreOnDispose = true,
    onError = () => {},
    onSuccess = () => {},
  } = options ?? {}

  const state = shallow ? shallowRef(initialState) : ref(initialState)
  const isLoading = ref(false)
  const isFinished = ref(false)
  const error = shallowRef<unknown | null>(null)

  let executionsCount = 0

  async function execute(...args: unknown[]) {
    const currentExecutionId = ++executionsCount

    if (resetOnExecute) {
      state.value = toValue(initialState)
    }

    isLoading.value = true
    isFinished.value = false
    error.value = null

    try {
      const result = await promiseFn(...args as Params)
      if (currentExecutionId === executionsCount)
        state.value = result
      onSuccess(result)
      return result
    }
    catch (e) {
      if (currentExecutionId === executionsCount)
        error.value = e
      onError(e)
    }
    finally {
      if (currentExecutionId === executionsCount)
        isLoading.value = false
      isFinished.value = true
    }
  }

  onScopeDispose(() => {
    if (ignoreOnDispose)
      executionsCount = 0 // make all currentExecutionIds mismatched
  })

  if (immediate)
    execute()

  return {
    state: state as State<T, Shallow>,
    isLoading,
    isFinished,
    error,
    execute,
  }
}
