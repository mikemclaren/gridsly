import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input'
import { Box, Heading } from '@chakra-ui/layout'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil'
import { playerEditOpenState, selectedPlayerState } from '../state/controls'
import { PartialEntity } from './Point'
import { SketchPicker, ColorResult } from 'react-color'
import { CloseIcon, StarIcon } from '@chakra-ui/icons'
import { IconButton } from '@chakra-ui/button'

export const PlayerEditBar = ({
  updateSelectedPlayer = (entity: PartialEntity) => {}
}) => {
  const selectedPlayer = useRecoilValue(selectedPlayerState)

  const [symbol, setSymbol] = useState('')
  const [color, setColor] = useState('')
  const [name, setName] = useState('')
  const setPlayerEditOpen = useSetRecoilState(playerEditOpenState)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const colorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSymbol(selectedPlayer.entity?.symbol || '')
    setColor(selectedPlayer.entity?.color || '')
    setName(selectedPlayer.entity?.name || '')
  }, [selectedPlayer])

  useLayoutEffect(() => {
    function clickHandler(this: Document, ev: MouseEvent): any {
      if (
        colorPickerOpen &&
        colorRef.current &&
        !colorRef.current.contains(ev.target as Node)
      ) {
        setColorPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', clickHandler)

    return () => {
      document.removeEventListener('mousedown', clickHandler)
    }
  }, [colorPickerOpen])

  const handleSymbolChange = (
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    const val = event.currentTarget.value
    setSymbol(val)
    updateSelectedPlayer({
      symbol: val
    })
  }

  const handleNameChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const val = event.currentTarget.value
    setName(val)
    updateSelectedPlayer({
      name: val
    })
  }

  const toggleColorPicker = () => {
    setColorPickerOpen(true)
  }

  const onColorChange = (c: ColorResult): void => {
    updateSelectedPlayer({
      color: c.hex
    })
    setColor(c.hex)
  }

  return (
    <Box
      position="fixed"
      left={8}
      top={6}
      bgColor="white"
      width="16em"
      padding="1em"
      zIndex="10"
      border="1px"
    >
      <Heading as="h3" size="md">
        Edit {selectedPlayer != null ? 'Player' : 'Creature'}
      </Heading>

      <IconButton colorScheme="purple" size="sm" aria-label="Close" icon={<CloseIcon />} position="absolute" right="2" top="2" onClick={() => setPlayerEditOpen(false)} />

      <FormControl marginTop="1">
        <FormLabel fontSize="small">Name</FormLabel>
        <Input
          type="text"
          maxLength={32}
          value={name}
          onChange={handleNameChange}
        />
      </FormControl>

      <FormControl marginTop="1">
        <FormLabel fontSize="small">Display Symbol</FormLabel>
        <Input
          type="text"
          maxLength={1}
          value={symbol}
          onChange={handleSymbolChange}
        />
      </FormControl>

      <FormControl ref={colorRef} marginTop="3">
        <FormLabel fontSize="small">Color</FormLabel>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<StarIcon color={color} />}
          />
          <Input type="text" value={color} onClick={toggleColorPicker} />
        </InputGroup>

        {colorPickerOpen && (
          <Box marginTop="2" position="absolute">
            <SketchPicker color={color} onChangeComplete={onColorChange} />
          </Box>
        )}
      </FormControl>
    </Box>
  )
}
