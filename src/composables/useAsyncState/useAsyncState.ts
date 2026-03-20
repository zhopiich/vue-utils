export interface AsyncStateOptions<T> {
  immediate?: boolean
  shallow?: boolean
  resetOnExecute?: boolean
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
    onError = () => {},
    onSuccess = () => {},
  } = options ?? {}

  const state = shallow ? shallowRef(initialState) : ref(initialState)
  const isLoading = ref(false)
  const error = shallowRef<unknown | null>(null)

  // TODO: abort controller
  async function execute(...args: unknown[]) {
    if (resetOnExecute) {
      state.value = toValue(initialState)
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await promiseFn(...args)
      state.value = result
      onSuccess(result)
      return result
    }
    catch (e) {
      error.value = e
      onError(e)
    }
    finally {
      isLoading.value = false
    }
  }

  if (immediate)
    execute()

  return { state, isLoading, error, execute }
}
