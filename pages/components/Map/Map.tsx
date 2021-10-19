import { Box } from "@chakra-ui/layout";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage as StageType } from "konva/lib/Stage";
import { useCallback, useLayoutEffect, useRef, useState, useEffect } from "react";
import { KonvaNodeComponent, Stage } from "react-konva";
import { CELL_SCALAR } from "../../_vars";
import MapControls from "../MapControls";
import MapGrid from "../MapGrid";
import { Coordinates, Point } from "../Point";
import FileSaver from "file-saver";

export enum Layers {
  SPACES = 0,
  BARRIERS = 1,
  MOUSE = 2
}

export type LayerType = {
  name: string,
  points: Point[]
}

const generateTestGrid = (size = 16) => {
  let layers: LayerType[] = [];
  layers[Layers.SPACES] = {
    name: 'SPACES',
    points: []
  };

  layers[Layers.BARRIERS] = {
    name: 'BARRIERS',
    points: []
  };

  layers[Layers.MOUSE] = {
    name: 'MOUSE',
    points: []
  };

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      layers[Layers.SPACES].points.push({
        coordinates: {
          x, y,
        },
        width: 1,
        height: 1,
      })
    }
  }

  return layers
};

const cellDoesNotExist = (points: Point[], { x, y }:Coordinates) => {
  for (let i = 0; i < points.length; i++) {
    if (points[i].coordinates.x === x && points[i].coordinates.y === y) {
      return false
    }
  }

  return true
};

export default function Map() {
  const PADDING = CELL_SCALAR*4;

  const [transformStr, setTransformStr] = useState('')
  const [stageX, setStageX] = useState(0)
  const [stageY, setStageY] = useState(0)
  const [height, setHeight] = useState(window.innerHeight + PADDING * 2)
  const [width, setWidth] = useState(window.innerWidth + PADDING * 2)
  const [selectedTool, setSelectedTool] = useState('')
  const [bufferX, setBufferX] = useState(PADDING)
  const [bufferY, setBufferY] = useState(PADDING)
  const [labelZeroX, setLabelZeroX] = useState(0)
  const [labelZeroY, setLabelZeroY] = useState(0)
  const [zoomVal, setZoomVal] = useState(.5)
  const [layers, setLayers] = useState<LayerType[]>(generateTestGrid())
  const [rectangleStarted, setRectangleStarted] = useState<Coordinates | null>(null)
  const [rectangleEnd, setRectangleEnd] = useState<Coordinates | null>(null)
  const stageRef = useRef<StageType>(null);

  const boxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reposition = () => {
      if (boxRef.current !== null) {
        const dx = boxRef.current.scrollLeft - PADDING;
        const dy = boxRef.current.scrollTop - PADDING;
        setTransformStr(`translate(${dx}px, ${dy}px)`)
        setStageX((x) => -dx)
        setStageY((y) => -dy)
      }
    };

    boxRef.current?.addEventListener('scroll', reposition)
    reposition()

    return () => {
      boxRef.current?.removeEventListener('scroll', reposition)
    }
  }, [boxRef.current]);


  useLayoutEffect(() => {
    setWidth(window.innerWidth + PADDING * 2 * zoomVal)
    setHeight(window.innerHeight + PADDING * 2 * zoomVal)
  }, [zoomVal]);

  useEffect(() => {
    setLayers(ls => {
      if (rectangleStarted && rectangleEnd) {
        ls[Layers.MOUSE].points = [
          {
            coordinates: {
              x: rectangleStarted.x < rectangleEnd.x ? rectangleStarted.x : rectangleEnd.x,
              y: rectangleStarted.y < rectangleEnd.y ? rectangleStarted.y : rectangleEnd.y,
            },
            width: Math.abs(rectangleStarted.x - rectangleEnd.x) + 1,
            height: Math.abs(rectangleStarted.y - rectangleEnd.y) + 1,
            type: 'mouse-select'
          }
        ]

        return [...ls]
      }

      ls[Layers.MOUSE].points = []
      return [...ls]
    })
  }, [rectangleStarted, rectangleEnd]);

  const selectTool = (tool: string) => {
    setSelectedTool(tool)
  }

  const mousePosOnGrid = (x: number, y: number) => {
    const gridX = Math.floor((x-bufferX)/(CELL_SCALAR*zoomVal))
    const gridY = Math.floor((y-bufferY)/(CELL_SCALAR*zoomVal))

    return [gridX, gridY]
  }

  const addSingleSpace = (gridX: number, gridY: number) => {
    setLayers(l => {
      if (cellDoesNotExist(l[Layers.SPACES].points, { x: gridX, y: gridY })) {
        l[Layers.SPACES].points = [ ...l[Layers.SPACES].points, {
          coordinates: {
            x: gridX,
            y: gridY
          },
          width: 1,
          height: 1
        } ]
        return [ ...l ]
      }

      return [ ...l ]
    })
  }

  const addRectangleSpaces = () => {
    if (rectangleStarted && rectangleEnd) {
      setLayers(l => {
        const width = Math.abs(rectangleStarted.x - rectangleEnd.x) + 1;
        const height = Math.abs(rectangleStarted.y - rectangleEnd.y) + 1;
  
        let x = rectangleStarted.x < rectangleEnd.x ? rectangleStarted.x : rectangleEnd.x;
        let y = rectangleStarted.y < rectangleEnd.y ? rectangleStarted.y : rectangleEnd.y;

        const newPoints = [];
        for (let addX = 0; addX < width; addX++) {
          for (let addY = 0; addY < height; addY++) {
            if (cellDoesNotExist(l[Layers.SPACES].points, { x: x + addX, y: y + addY })) {
              newPoints.push({
                coordinates: {
                  x: x + addX,
                  y: y + addY,
                },
                width: 1,
                height: 1
              })
            }
          }
        }

        l[Layers.SPACES].points = [...l[Layers.SPACES].points, ...newPoints]
        return [ ...l ]
      });
    }
  }

  const handleRectangleClick = useCallback((gridX: number, gridY: number) => {
    if (!rectangleStarted) {
      setRectangleStarted({ x: gridX, y: gridY });
      return;
    } else {
      addRectangleSpaces()
      setRectangleStarted(null)
      setRectangleEnd(null)
    }
  }, [ rectangleStarted, rectangleEnd ])

  const onGridMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (rectangleStarted) {
      const node = e.evt?.target as HTMLElement;
      const { top, left } = node.getBoundingClientRect();
      const [gridX, gridY] = mousePosOnGrid(e.evt.clientX - (left * 2), e.evt.clientY - (top * 2))
      if (rectangleEnd?.x !== gridX || rectangleEnd?.y !== gridY) {
        setRectangleEnd({ x: gridX, y: gridY })
      }
    }
  }

  const onGridClick = (e: KonvaEventObject<MouseEvent>) => {
    const node = e.evt?.target as HTMLElement;
    const { top, left } = node.getBoundingClientRect();
    const [gridX, gridY] = mousePosOnGrid(e.evt.clientX - (left * 2), e.evt.clientY - (top * 2))
    if (gridX < labelZeroX) {
      setLabelZeroX(gridX)
    }

    if (gridY < labelZeroY) {
      setLabelZeroY(gridY)
    }

    switch(selectedTool) {
      case 'single-space':
        addSingleSpace(gridX, gridY)
        setRectangleStarted(null)
        setRectangleEnd(null)
        break;
      case 'rectangle-space':
        handleRectangleClick(gridX, gridY)
        break;
    }
  }

  const exportPNG = () => {
    if (stageRef?.current) {
      const uri = stageRef.current.toDataURL();
      FileSaver.saveAs(uri, "Gridsly.png");
    }
  }

  const changeZoom = (zoomLevel: number) => () => {
    setZoomVal(z => z + zoomLevel > 0 && z + zoomLevel < 5.5 ? z + zoomLevel : z)
  }

  return (
    <Box
      ref={boxRef}
      overflow="auto"
      width={window.innerWidth}
      height={window.innerHeight}
      bgColor="blackAlpha.700"
    >
      <Stage
        width={width}
        height={height}
        x={stageX}
        y={stageY}
        transform={transformStr}
        onClick={onGridClick}
        onMouseMove={onGridMouseMove}
        ref={stageRef}
      >
        <MapGrid
          width={width}
          height={height}
          zoom={zoomVal}
          layers={layers}
          labelZeroX={labelZeroX}
          labelZeroY={labelZeroY}
        />
      </Stage>

      <MapControls
        selectTool={selectTool}
        exportPNG={exportPNG}
        changeZoom={changeZoom}
        zoom={zoomVal}
      />
    </Box>
  );
}