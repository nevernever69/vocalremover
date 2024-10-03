'use client'
import { AppShell,  Stack, Text, Button, Group} from '@mantine/core';
import { IconMenu2, IconEraser, IconArrowsSplit, IconWaveSine, IconKeyframes, IconScissors, IconPuzzle, IconMicrophone, IconDisc, IconHelp } from '@tabler/icons-react';
import { GB } from 'country-flag-icons/react/3x2';
import { useState } from 'react';

export default function AudioCutterLayout({ children }: { children: React.ReactNode }) {
 
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      header={{ height: 0 }}
      navbar={{
        width: 60,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Navbar p="xs">
        <Stack justify="space-between" h="100%">
          <Stack>
            <NavbarIcon icon={IconMenu2} />
            <NavbarIcon icon={IconEraser} />
            <NavbarIcon icon={IconArrowsSplit} />
            <NavbarIcon icon={IconWaveSine} />
            <NavbarIcon icon={IconKeyframes} />
            <NavbarIcon icon={IconScissors} />
            <NavbarIcon icon={IconPuzzle} />
            <NavbarIcon icon={IconMicrophone} />
            <NavbarIcon icon={IconDisc} />
          </Stack>
          <Stack>
            <NavbarIcon icon={IconHelp} />
            <GB style={{ width: '24px', height: '24px' }} />
          </Stack>
        </Stack>
      </AppShell.Navbar>
      
      <AppShell.Main>
        <Stack align="center" justify="center" h="100vh" spacing="xl">
   
          <Group c="dimmed">

        <p >HOW IT WORKS</p>
        <p >JOINER</p>

        </Group>
          <Text size="2.5rem" weight={700}>Audio Cutter</Text>
          <Text size="lg" c="dimmed">Free editor to trim and cut any audio file online</Text>
          <Button size="lg" variant="filled" color="blue">
            Browse my files
          </Button>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}

function NavbarIcon({ icon: Icon }: { icon: React.ElementType }) {
  return <Icon size={24} style={{ cursor: 'pointer' }} />;
}