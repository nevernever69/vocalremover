import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css';

const inter = Inter({ subsets: ['latin'] })

const theme = createTheme({
  /** Put your mantine theme override here */
});

export const metadata: Metadata = {
  title: 'Audio Cutter',
  description: 'Free editor to trim and cut any audio file online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}