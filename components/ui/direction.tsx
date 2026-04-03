"use client"

import * as React from "react"

type Direction = "ltr" | "rtl"

const DirectionContext = React.createContext<Direction>("ltr")

function DirectionProvider({
  dir,
  direction,
  children,
}: React.PropsWithChildren<{
  dir?: Direction
  direction?: Direction
}>) {
  return (
    <DirectionContext.Provider value={direction ?? dir ?? "ltr"}>
      {children}
    </DirectionContext.Provider>
  )
}

function useDirection() {
  return React.useContext(DirectionContext)
}

export { DirectionProvider, useDirection }
