import { Box, Container, Flex, Spacer, Text } from '@chakra-ui/layout'
import Head from 'next/head'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import { Button } from '@chakra-ui/button'

export interface MapProps {

}

const Map = dynamic<MapProps>(() => import('./components/Map/Map'), {
  ssr: false,
  loading: () => <p>...</p>
})

export default function Home() {
  return (
    <Box>
      <Head>
        <title>Gridsly</title>
        <meta name="description" content="Gridsly - the Little Gentleman" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Map />
    </Box>
  )
}
