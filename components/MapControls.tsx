import { Button, ButtonGroup, IconButton } from '@chakra-ui/button'
import { FormLabel } from '@chakra-ui/form-control'
import {
  AddIcon,
  AtSignIcon,
  ChevronDownIcon,
  DeleteIcon,
  DownloadIcon,
  DragHandleIcon,
  MinusIcon,
  PlusSquareIcon,
  SmallCloseIcon
} from '@chakra-ui/icons'
import { Box, HStack } from '@chakra-ui/layout'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu'
import { Stack } from '@chakra-ui/react'
import React from 'react'
import { useRecoilState } from 'recoil'
import { selectedToolState } from '../state/controls'

export const MapControls = ({
  exportPNG = () => {},
  changeZoom = (zoomDiff: number) => () => {},
  zoom = 0,
  selectMapToEdit = (num: number) => {},
  currentMap = 0
}) => {
  const [selectedTool, setSelectedTool] = useRecoilState(selectedToolState)
  return (
    <Box
      position="fixed"
      right={8}
      top={6}
      padding="1em"
      bgColor="white"
      width="12em"
    >
      <Box paddingBottom={10}>
        <Stack>
          <Button
            colorScheme="purple"
            width="100%"
            leftIcon={<DragHandleIcon />}
            variant={selectedTool === 'movement' ? 'solid' : 'outline'}
            onClick={() => setSelectedTool('movement')}
          >
            Move
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<PlusSquareIcon />}
              width="100%"
              colorScheme="purple"
              variant={
                ['single-space', 'rectangle-space'].indexOf(selectedTool) > -1
                  ? 'solid'
                  : 'outline'
              }
            >
              Space
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSelectedTool('single-space')}>
                Single Block
              </MenuItem>
              <MenuItem onClick={() => setSelectedTool('rectangle-space')}>
                Rectangle Tool
              </MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<SmallCloseIcon />}
              width="100%"
              colorScheme="purple"
              variant={
                ['single-wall', 'single-door', 'single-obstacle'].indexOf(
                  selectedTool
                ) > -1
                  ? 'solid'
                  : 'outline'
              }
            >
              {' '}
              Barriers
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSelectedTool('single-wall')}>
                Wall
              </MenuItem>
              <MenuItem onClick={() => setSelectedTool('single-door')}>
                Door
              </MenuItem>
              <MenuItem onClick={() => setSelectedTool('single-obstacle')}>
                Obstacle
              </MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<AtSignIcon />}
              width="100%"
              colorScheme="purple"
              variant={
                ['single-player', 'single-npc'].indexOf(selectedTool) > -1
                  ? 'solid'
                  : 'outline'
              }
            >
              {' '}
              Creatures
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSelectedTool('single-player')}>
                Player
              </MenuItem>
              <MenuItem onClick={() => setSelectedTool('single-npc')}>
                NPC
              </MenuItem>
            </MenuList>
          </Menu>
        </Stack>
      </Box>
      <Box paddingBottom={10}>
        <Button
          variant="outline"
          colorScheme="red"
          width="100%"
          leftIcon={<DeleteIcon />}
          onClick={() => setSelectedTool('eraser')}
          isActive={selectedTool === 'eraser'}
        >
          Erase
        </Button>
      </Box>

      <Box paddingBottom={10}>
        <Box>
          <FormLabel>Zoom: ({zoom * 100}%)</FormLabel>
        </Box>
        <ButtonGroup size="sm" variant="outline" isAttached width="100%">
          <IconButton
            aria-label="Zoom In"
            colorScheme="blue"
            onClick={changeZoom(0.25)}
            icon={<AddIcon />}
            width="100%"
          />
          <IconButton
            aria-label="Zoom Out"
            colorScheme="blue"
            onClick={changeZoom(-0.25)}
            icon={<MinusIcon />}
            width="100%"
          />
        </ButtonGroup>
      </Box>
      <Box paddingBottom={10}>
        <Button onClick={exportPNG} width="100%" leftIcon={<DownloadIcon />}>
          Export (PNG)
        </Button>
      </Box>
      <Box>
        <FormLabel>Maps:</FormLabel>
        <ButtonGroup width="100%">
          <Button
            isActive={currentMap === 0}
            onClick={() => selectMapToEdit(0)}
          >
            1
          </Button>
          <Button
            isActive={currentMap === 1}
            onClick={() => selectMapToEdit(1)}
          >
            2
          </Button>
          <Button
            isActive={currentMap === 2}
            onClick={() => selectMapToEdit(2)}
          >
            3
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  )
}

export default MapControls
