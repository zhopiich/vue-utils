export interface AsyncStateOptions<T> {
  immediate?: boolean
  initialState: T
  onError?: (e: unknown) => void
  onSuccess?: (data: T) => void
  shallow?: boolean
}

export function useAsyncState<T>(
  promiseFn: (...args: unknown[]) => Promise<T>,
  options: AsyncStateOptions<T>,
) {
  const {
    immediate = true,
    initialState,
    shallow = true,
    onError,
    onSuccess,
  } = options

  const data = shallow ? shallowRef<T>(initialState) : ref<T>(initialState)
  const isLoading = ref(false)
  const error = shallowRef<unknown | null>(null)

  // TODO: abort controller
  async function execute(...args: unknown[]) {
    isLoading.value = true
    error.value = null

    try {
      const result = await promiseFn(...args)
      data.value = result
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

  return { data, isLoading, error, execute }
}
