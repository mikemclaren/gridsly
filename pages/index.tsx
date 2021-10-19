import { Box } from '@chakra-ui/layout'
import Head from 'next/head'
import dynamic from 'next/dynamic'

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
