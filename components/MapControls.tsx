import { Button, ButtonGroup, IconButton } from '@chakra-ui/button'
import { FormLabel } from '@chakra-ui/form-control'
import {
  AddIcon,
  AtSignIcon,
  ChevronDownIcon,
  DeleteIcon,
  DownloadIcon,
  MinusIcon,
  PlusSquareIcon,
  SmallCloseIcon
} from '@chakra-ui/icons'
import { Box } from '@chakra-ui/layout'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu'
import Image from 'next/image'

// MAP CONTROL COMPONENT SHOULD BE NEXT FOR SURE
export const MapControls = ({
  selectTool = (tool: string) => {},
  exportPNG = () => {},
  changeZoom = (zoomDiff: number) => () => {},
  zoom = 0
}) => {
  return (
    <Box
      position="fixed"
      right={8}
      top={6}
      padding="1em"
      bgColor="white"
      width="12em"
    >
      <Box>
        <Image src="/Gridsly.png" width={60} height={60} />
      </Box>
      <Box paddingBottom={10}>
        <Box paddingBottom={2}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<PlusSquareIcon />}
              width="100%"
            >
              Space
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => selectTool('single-space')}>
                Single Block
              </MenuItem>
              <MenuItem onClick={() => selectTool('rectangle-space')}>
                Rectangle Tool
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Box paddingBottom={2}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<SmallCloseIcon />}
              width="100%"
            >
              {' '}
              Barriers
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => selectTool('single-wall')}>
                Wall
              </MenuItem>
              <MenuItem onClick={() => selectTool('single-door')}>
                Door
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Box>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<AtSignIcon />}
              width="100%"
            >
              {' '}
              Creatures
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => selectTool('single-player')}>
                Player
              </MenuItem>
              <MenuItem onClick={() => selectTool('single-npc')}>NPC</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
      <Box paddingBottom={10}>
        <Button
          variant="outline"
          colorScheme="red"
          width="100%"
          leftIcon={<DeleteIcon />}
          onClick={() => selectTool('eraser')}
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
      <Box>
        <Button onClick={exportPNG} width="100%" leftIcon={<DownloadIcon />}>
          Export (PNG)
        </Button>
      </Box>
    </Box>
  )
}

export default MapControls
