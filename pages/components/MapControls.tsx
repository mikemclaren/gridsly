import { Button, ButtonGroup, IconButton } from "@chakra-ui/button"
import { FormLabel } from "@chakra-ui/form-control"
import { AddIcon, ChevronDownIcon, DownloadIcon, MinusIcon, PlusSquareIcon, SmallCloseIcon } from "@chakra-ui/icons"
import { Box } from "@chakra-ui/layout"
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu"
import Image from 'next/image'

// MAP CONTROL COMPONENT SHOULD BE NEXT FOR SURE
export const MapControls = ({
  selectTool = (tool: string) => {},
  exportPNG = () => {},
  changeZoom = (zoomDiff: number) => () => {},
  zoom = 0,
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
        <Image src="/Gridsly.png" width={60} height={60}/>
      </Box>
      <Box paddingBottom={10}>
        <Box paddingBottom={2}>
          <Menu>
            <MenuButton as={Button} isFullWidth rightIcon={<ChevronDownIcon />} leftIcon={<PlusSquareIcon />}>Space</MenuButton>
            <MenuList>
              <MenuItem onClick={() => selectTool('single-space')}>Single Block</MenuItem>
              <MenuItem onClick={() => selectTool('rectangle-space')}>Rectangle Tool</MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Box>
          <Menu>
            <MenuButton as={Button} isFullWidth rightIcon={<ChevronDownIcon />} leftIcon={<SmallCloseIcon />}> Barriers</MenuButton>
            <MenuList>
              <MenuItem>Wall</MenuItem>
              <MenuItem>Door</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
      <Box paddingBottom={10}>
        <Box>
          <FormLabel>Zoom: ({zoom * 100}%)</FormLabel>
        </Box>
        <ButtonGroup size="sm" variant="outline" isAttached isFullWidth>
          <IconButton aria-label="Zoom In" colorScheme="blue" onClick={changeZoom(0.25)} icon={<AddIcon />} isFullWidth />
          <IconButton aria-label="Zoom Out" colorScheme="blue" onClick={changeZoom(-0.25)} icon={<MinusIcon />} isFullWidth />
        </ButtonGroup>
      </Box>
      <Box>
        <Button onClick={exportPNG} isFullWidth leftIcon={<DownloadIcon />}>Export (PNG)</Button>
      </Box>
    </Box>
  )
}

export default MapControls