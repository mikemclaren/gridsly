import { Circle, Rect, Text } from 'react-konva'
import { CELL_SCALAR } from '../_vars'

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
  point: { coordinates, width, height, type = 'space', position = 'left' },
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
          stroke="blue"
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
          fill="rgba(0, 0, 0, 0.5)"
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
      return (
        <PlayerComponent
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
        fill="white"
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
        fill="#718096"
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
      fill="rgba(0, 0, 0, 0.5)"
      id={`${coordinates.x}:${coordinates.y}`}
    />
  )
}

const PlayerComponent = ({
  point: { coordinates, width, height },
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
      <Circle
        x={x + calcWidth / 2}
        y={y + calcHeight / 2}
        width={calcWidth}
        height={calcHeight}
        fill="red"
        id={`${coordinates.x}:${coordinates.y}`}
      />
      <Text
        text="@"
        fontSize={(CELL_SCALAR * zoom) / 2}
        fontStyle="bold"
        x={x}
        y={y + ((CELL_SCALAR * zoom) / 2 - (CELL_SCALAR * zoom) / 4)}
        fill="#FFFFFF"
        width={width * CELL_SCALAR * zoom}
        align="center"
        id={`${coordinates.x}:${coordinates.y}`}
      />
    </>
  )
}
