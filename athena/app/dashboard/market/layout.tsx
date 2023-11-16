import React, { ReactNode } from 'react'
import MarketTopBar from './components/market-topbar'

interface Props {
    children: ReactNode
}
function layout(props: Props) {
    const { children } = props
  return (
    <div className="flex flex-col items-center justify-start col-span-4 w-full h-screen relative ">
        {/* <MarketTopBar/> */}
        <div className="flex flex-col pt-5 px-5 w-full h-full overflow-y-scroll">
            {children}
        </div>
    </div>
  )
}

export default layout