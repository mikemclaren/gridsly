import { Rect, Text } from "react-konva"
import { CELL_SCALAR } from "../_vars";

// allows for easy repeat
const ABCS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆËĮØÛ'
const charAt = (index: number) => {
  let trueIndex = index;
  while (trueIndex >= ABCS.length) {
    trueIndex -= ABCS.length
  }

  return ABCS[trueIndex];
};

export type Coordinates = {
  x: number
  y: number
}

export type Point = {
  coordinates: Coordinates
  width: number
  height: number
  type?: string
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
    type = 'space'
  },
  zoom,
  labelZeroX,
  labelZeroY
}: ComponentProps) => {
  switch (type) {
    case 'mouse-select':
      return (
        <Rect
          x={coordinates.x*CELL_SCALAR*zoom}
          y={coordinates.y*CELL_SCALAR*zoom}
          width={width*CELL_SCALAR*zoom}
          height={height*CELL_SCALAR*zoom}
          fill="rgba(0, 0, 0, 0.25)"
          strokeWidth={2*zoom}
          stroke="blue"
          id={`${coordinates.x}:${coordinates.y}`}
        />
      );
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
};

const SpaceComponent = ({
  point: {
    coordinates,
    width,
    height,
    type = 'space'
  },
  zoom,
  labelZeroX,
  labelZeroY
}: ComponentProps) => {
  return (
    <>
      <Rect
        x={coordinates.x*CELL_SCALAR*zoom}
        y={coordinates.y*CELL_SCALAR*zoom}
        width={width*CELL_SCALAR*zoom}
        height={height*CELL_SCALAR*zoom}
        fill="white"
        strokeWidth={2*zoom}
        stroke="#CBD5E0"
        id={`${coordinates.x}:${coordinates.y}`}
      />
      <Text
        text={`${charAt(coordinates.x+Math.abs(labelZeroX))}${coordinates.y+Math.abs(labelZeroY)}`}
        fontSize={CELL_SCALAR*zoom/4}
        x={coordinates.x*CELL_SCALAR*zoom}
        y={coordinates.y*CELL_SCALAR*zoom+(CELL_SCALAR*zoom/2-CELL_SCALAR*zoom/8)}
        fill="#718096"
        width={width*CELL_SCALAR*zoom}
        align="center"
        id={`${coordinates.x}:${coordinates.y}`}
      />
    </>
  );
}