export interface AsyncStateOptions<T> {
  immediate?: boolean
  onError?: (e: unknown) => void
  onSuccess?: (data: T) => void
  shallow?: boolean
}

export function useAsyncState<T>(
  promiseFn: (...args: unknown[]) => Promise<T>,
  initialState: MaybeRef<T>,
  options: AsyncStateOptions<T>,
) {
  const {
    immediate = true,
    shallow = true,
    onError,
    onSuccess,
  } = options

  const state = shallow ? shallowRef(initialState) : ref(initialState)
  const isLoading = ref(false)
  const error = shallowRef<unknown | null>(null)

  // TODO: abort controller
  async function execute(...args: unknown[]) {
    isLoading.value = true
    error.value = null

    try {
      const result = await promiseFn(...args)
      state.value = result
      onSuccess?.(result)
    }
    catch (e) {
      error.value = e
      onError?.(e)
    }
    finally {
      isLoading.value = false
    }
  }

  if (immediate)
    execute()

  return { state, isLoading, error, execute }
}
