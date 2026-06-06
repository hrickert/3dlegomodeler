import { createContext, useContext } from 'react'
import { rootStore, type RootStore } from '../stores/root-store'

const StoreContext = createContext<RootStore>(rootStore)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
}

export function useStore(): RootStore {
  return useContext(StoreContext)
}
