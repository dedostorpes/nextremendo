import { Toaster } from 'sonner'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp