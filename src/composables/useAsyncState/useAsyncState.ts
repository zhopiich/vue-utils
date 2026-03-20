export interface AsyncStateOptions<T> {
  immediate?: boolean
  shallow?: boolean
  resetOnExecute?: boolean
  ignoreOnDispose?: boolean
  onError?: (e: unknown) => void
  onSuccess?: (data: T) => void
}

export function useAsyncState<T>(
  promiseFn: (...args: unknown[]) => Promise<T>,
  initialState: MaybeRef<T>,
  options?: AsyncStateOptions<T>,
) {
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
      const result = await promiseFn(...args)
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

  return { state, isLoading, isFinished, error, execute }
}
