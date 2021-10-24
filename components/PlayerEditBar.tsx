import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input'
import { Box, Heading } from '@chakra-ui/layout'
import React, { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { selectedPlayerState } from '../state/controls'
import { PartialEntity } from './Point'
import { SketchPicker, ColorResult } from 'react-color'
import { StarIcon } from '@chakra-ui/icons'

export const PlayerEditBar = ({
  updateSelectedPlayer = (entity: PartialEntity) => {}
}) => {
  const selectedPlayer = useRecoilValue(selectedPlayerState)

  const [symbol, setSymbol] = useState('')
  const [color, setColor] = useState('')
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  useEffect(() => {
    setSymbol(selectedPlayer.entity?.symbol || '')
    setColor(selectedPlayer.entity?.color || '')
  }, [selectedPlayer])

  const handleSymbolChange = (
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    const val = event.currentTarget.value
    setSymbol(val)
    updateSelectedPlayer({
      symbol: val
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

      <FormControl>
        <FormLabel>Display Symbol</FormLabel>
        <Input
          type="text"
          maxLength={1}
          value={symbol}
          onChange={handleSymbolChange}
        />
        <FormHelperText>
          This symbol will be displayed on the map.
        </FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel>Color</FormLabel>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<StarIcon color={color} />}
          />
          <Input type="text" value={color} onClick={toggleColorPicker} />
        </InputGroup>

        {colorPickerOpen && (
          <SketchPicker color={color} onChangeComplete={onColorChange} />
        )}
      </FormControl>
    </Box>
  )
}
