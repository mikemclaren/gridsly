import React, { useCallback, useState, useEffect } from 'react'
import { Circle, Rect, Text } from 'react-konva'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  playerEditOpenState,
  selectedPlayerState,
  selectedToolState
} from '../state/controls'
import { calculateTextColorForBackground, CELL_SCALAR } from '../_vars'

// allows for easy repeat
const ABCS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆËĮØÛ'
const charAt = (index: number) => {
  let trueIndex = index
  while (trueIndex >= ABCS.length) {
    trueIndex -= ABCS.length
  }

  return ABCS[trueIndex]
}

export type Coordinates = {
  x: number
  y: number
}

export type Entity = {
  name: string
  color: string
  symbol: string
  type: string
}

export type PartialEntity = {
  symbol?: string
  color?: string
  type?: string
  name?: string
}

export type Point = {
  coordinates: Coordinates
  width: number
  height: number
  type?: string
  position?: string
  entity?: Entity
}

type ComponentProps = {
  point: Point
  zoom: number
  labelZeroY: number
  labelZeroX: number
}

export const PointComponent = ({
  point: {
    coordinates,
    width,
    height,
    type = 'space',
    position = 'left',
    entity
  },
  zoom,
  labelZeroX,
  labelZeroY
}: ComponentProps) => {
  const x = coordinates.x * CELL_SCALAR * zoom
  const y = coordinates.y * CELL_SCALAR * zoom

  const calcWidth = width * CELL_SCALAR * zoom
  const calcHeight = height * CELL_SCALAR * zoom

  switch (type) {
    case 'mouse-select':
      return (
        <Rect
          x={x}
          y={y}
          width={calcWidth}
          height={calcHeight}
          fill="rgba(0, 0, 0, 0.25)"
          strokeWidth={2 * zoom}
          stroke="#4A5568"
          id={`${coordinates.x}:${coordinates.y}`}
        />
      )
    case 'wall':
      return (
        <Rect
          x={x}
          y={y}
          width={calcWidth}
          height={calcHeight}
          fill="#718096"
          id={`${coordinates.x}:${coordinates.y}`}
        />
      )
    case 'obstacle':
      return (
        <Rect
          x={x}
          y={y}
          width={calcWidth}
          height={calcHeight}
          fill="#FAF089"
          id={`${coordinates.x}:${coordinates.y}`}
        />
      )
    case 'door':
      return (
        <DoorComponent
          point={{
            coordinates,
            height,
            width,
            position
          }}
          zoom={zoom}
          labelZeroX={labelZeroX}
          labelZeroY={labelZeroY}
        />
      )
    case 'player':
    case 'npc':
      return (
        <PlayerComponent
          point={{
            coordinates,
            height,
            width,
            position,
            entity
          }}
          zoom={zoom}
          labelZeroX={labelZeroX}
          labelZeroY={labelZeroY}
        />
      )
    case 'space':
    default:
      return (
        <SpaceComponent
          point={{
            coordinates,
            width,
            height
          }}
          zoom={zoom}
          labelZeroX={labelZeroX}
          labelZeroY={labelZeroY}
        />
      )
  }
}

const SpaceComponent = ({
  point: { coordinates, width, height, type = 'space' },
  zoom,
  labelZeroX,
  labelZeroY
}: ComponentProps) => {
  const x = coordinates.x * CELL_SCALAR * zoom
  const y = coordinates.y * CELL_SCALAR * zoom

  const calcWidth = width * CELL_SCALAR * zoom
  const calcHeight = height * CELL_SCALAR * zoom

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={calcWidth}
        height={calcHeight}
        fill="#E2E8F0"
        strokeWidth={2 * zoom}
        stroke="#CBD5E0"
        id={`${coordinates.x}:${coordinates.y}`}
      />
      <Text
        text={`${charAt(coordinates.x + Math.abs(labelZeroX))}${
          coordinates.y + Math.abs(labelZeroY)
        }`}
        fontSize={(CELL_SCALAR * zoom) / 4}
        x={x}
        y={y + ((CELL_SCALAR * zoom) / 2 - (CELL_SCALAR * zoom) / 8)}
        fill="#2D3748"
        width={width * CELL_SCALAR * zoom}
        align="center"
        id={`${coordinates.x}:${coordinates.y}`}
      />
    </>
  )
}

const DoorComponent = ({
  point: { coordinates, width, height, position = 'left' },
  zoom
}: ComponentProps) => {
  const fullWidth = width * CELL_SCALAR * zoom
  const fullHeight = height * CELL_SCALAR * zoom
  let calcWidth = fullWidth
  let calcHeight = fullHeight
  let calcX = coordinates.x * CELL_SCALAR * zoom
  let calcY = coordinates.y * CELL_SCALAR * zoom

  if (position === 'left' || position === 'right') {
    calcWidth /= 4

    if (position === 'right') {
      calcX = calcX + fullWidth - calcWidth
    }
  } else if (position === 'top' || position === 'bottom') {
    calcHeight /= 4

    if (position === 'bottom') {
      calcY = calcY + fullHeight - calcHeight
    }
  }

  return (
    <Rect
      x={calcX}
      y={calcY}
      width={calcWidth}
      height={calcHeight}
      fill="#9C4221"
      id={`${coordinates.x}:${coordinates.y}`}
    />
  )
}

const PlayerComponent = ({
  point,
  zoom,
  labelZeroX,
  labelZeroY
}: ComponentProps) => {
  const x = point.coordinates.x * CELL_SCALAR * zoom
  const y = point.coordinates.y * CELL_SCALAR * zoom

  const selectedTool = useRecoilValue(selectedToolState)

  const [selectedPlayer, setSelectedPlayer] =
    useRecoilState(selectedPlayerState)
  const setPlayerEditOpen = useSetRecoilState(playerEditOpenState)
  const [accentColor, setAccentColor] = useState('')
  const [calcWidth, setCalcWidth] = useState(point.width * CELL_SCALAR * zoom)
  const [calcHeight, setCalcHeight] = useState(
    point.height * CELL_SCALAR * zoom
  )

  useEffect(() => {
    setAccentColor(
      point.entity?.color
        ? calculateTextColorForBackground(point.entity?.color)
        : '#FFF'
    )
  }, [point.entity?.color])

  useEffect(() => {
    setCalcWidth(point.width * CELL_SCALAR * zoom)
    setCalcHeight(point.height * CELL_SCALAR * zoom)
  }, [point.width, point.height, zoom])

  const onClick = useCallback(() => {
    if (selectedTool === 'single-player') {
      setSelectedPlayer({
        ...point,
        entity: point.entity ? { ...point.entity } : undefined
      })
      setPlayerEditOpen(true)
    } else if (selectedTool === 'single-npc') {
      setSelectedPlayer({
        ...point,
        entity: point.entity ? { ...point.entity } : undefined
      })
      setPlayerEditOpen(true)
    }
  }, [selectedTool])

  return (
    <>
      {point.entity?.type === 'player' && (
        <Circle
          x={x + calcWidth / 2}
          y={y + calcHeight / 2}
          width={calcWidth}
          height={calcHeight}
          fill={point.entity?.color || 'red'}
          id={`${point.coordinates.x}:${point.coordinates.y}`}
          onClick={onClick}
          strokeWidth={
            selectedPlayer?.coordinates === point.coordinates
              ? 4 * zoom
              : 2 * zoom
          }
          stroke={
            selectedPlayer?.coordinates === point.coordinates
              ? '#F56565'
              : accentColor
          }
        />
      )}
      {point.entity?.type === 'npc' && (
        <Rect
          x={x}
          y={y}
          width={calcWidth}
          height={calcHeight}
          fill={point.entity?.color || '#805ad5'}
          id={`${point.coordinates.x}:${point.coordinates.y}`}
          onClick={onClick}
          stroke={
            selectedPlayer?.coordinates === point.coordinates ? '#F56565' : ''
          }
          strokeWidth={
            selectedPlayer?.coordinates === point.coordinates ? 4 * zoom : 0
          }
        />
      )}

      <Text
        text={point.entity?.symbol || '@'}
        fontSize={(CELL_SCALAR * zoom * point.width) / 1.8}
        fontStyle="bold"
        fontFamily="monospace"
        fill={accentColor}
        x={x}
        y={
          y +
          ((CELL_SCALAR * zoom * point.width) / 2 -
            (CELL_SCALAR * zoom * point.height) / 4)
        }
        width={point.width * CELL_SCALAR * zoom}
        align="center"
        id={`${point.coordinates.x}:${point.coordinates.y}`}
        onClick={onClick}
      />
    </>
  )
}
