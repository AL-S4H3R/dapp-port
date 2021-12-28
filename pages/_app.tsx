import '@fontsource/share-tech-mono'
import type { AppProps } from 'next/app'
import { Fragment } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { MoralisProvider } from 'react-moralis'

import { DAppProvider, Config, Polygon, Mumbai, Mainnet } from '@usedapp/core'
const config : Config = {
  networks: [Polygon, Mumbai, Mainnet]
}


const appId = 'sQH0FwekBbFus2Luk2x1kMKV5J50GSw2RRhOVdzh'
const serverUrl = 'https://mlxliwgdres9.usemoralis.com:2053/server'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <DAppProvider config={config}>
      {/* <MoralisProvider appId={appId} serverUrl={serverUrl}> */}
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      {/* </MoralisProvider> */}
      </DAppProvider>
    </Fragment>
  )
}

export default MyApp
