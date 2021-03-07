
import { provide , inject , Ref , ref } from 'vue';

const StoreSymbol = Symbol()

export function provideStore(store:Ref<string>) {
  provide(StoreSymbol, store)
}

export function useStore() {
  const store = inject(StoreSymbol , ref(''));
  if (!store) {
    // 抛出错误，不提供 store
  }
  return store
}