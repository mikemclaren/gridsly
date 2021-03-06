import { Box } from '@chakra-ui/layout'
import { KonvaEventObject } from 'konva/lib/Node'
import { Stage as StageType } from 'konva/lib/Stage'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect
} from 'react'
import { Layer, Stage } from 'react-konva'
import { CELL_SCALAR } from '../../_vars'
import MapControls from '../MapControls'
import { Coordinates, Entity, PartialEntity, Point, PointComponent } from '../Point'
import FileSaver from 'file-saver'
import {
  useRecoilBridgeAcrossReactRoots_UNSTABLE,
  useRecoilState
} from 'recoil'
import {
  playerEditOpenState,
  selectedPlayerState,
  selectedToolState
} from '../../state/controls'
import { PlayerEditBar } from '../PlayerEditBar'

export enum Layers {
  SPACES = 0,
  BARRIERS = 1,
  PLAYERS = 2,
  MOUSE = 3
}

export type LayerType = {
  name: string
  points: Point[]
}

const generateTestGrid = (size = 16) => {
  let layers: LayerType[] = []
  layers[Layers.SPACES] = {
    name: 'SPACES',
    points: []
  }

  layers[Layers.BARRIERS] = {
    name: 'BARRIERS',
    points: []
  }

  layers[Layers.PLAYERS] = {
    name: 'PLAYERS',
    points: []
  }

  layers[Layers.MOUSE] = {
    name: 'MOUSE',
    points: []
  }

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      layers[Layers.SPACES].points.push({
        coordinates: {
          x,
          y
        },
        width: 1,
        height: 1
      })
    }
  }

  return layers
}

const cellDoesNotExist = (points: Point[], { x, y }: Coordinates) => {
  for (let cell of points) {
    if (cell.coordinates.x === x && cell.coordinates.y === y) {
      return false
    }
  }

  return true
}

const findCell = (points: Point[], { x, y }: Coordinates) => {
  for (let cell of points) {
    if (cell.coordinates.x === x && cell.coordinates.y === y) {
      return cell
    }
  }

  return null
}

const eraseCell = (points: Point[], { x, y }: Coordinates): Point[] => {
  for (let i = 0; i < points.length; i++) {
    if (points[i].coordinates.x === x && points[i].coordinates.y === y) {
      points.splice(i, 1)
      break
    }
  }

  return points
}

const rotatePosition = (position: string | undefined) => {
  switch (position) {
    case 'left':
      return 'bottom'
    case 'bottom':
      return 'right'
    case 'right':
      return 'top'
    case 'top':
      return 'left'
    default:
      return 'left'
  }
}

const hash = async (str: string) => {
  const utf8 = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('')

  return hashHex
}

export default function Map() {
  const PADDING = CELL_SCALAR * 6

  const [transformStr, setTransformStr] = useState('')
  const [stageX, setStageX] = useState(0)
  const [stageY, setStageY] = useState(0)
  const [height, setHeight] = useState(window.innerHeight + PADDING * 2)
  const [width, setWidth] = useState(window.innerWidth + PADDING * 2)
  const [selectedTool, setSelectedTool] = useRecoilState(selectedToolState)
  const [bufferX, setBufferX] = useState(PADDING)
  const [bufferY, setBufferY] = useState(PADDING)
  const [labelZeroX, setLabelZeroX] = useState(0)
  const [labelZeroY, setLabelZeroY] = useState(0)
  const [zoomVal, setZoomVal] = useState(0.5)
  const [layers, setLayers] = useState<LayerType[]>(generateTestGrid())
  const [currentMap, setCurrentMap] = useState<number>(0)
  const [rectangleStarted, setRectangleStarted] = useState<Coordinates | null>(
    null
  )
  const [rectangleEnd, setRectangleEnd] = useState<Coordinates | null>(null)
  const [mapHash, setMapHash] = useState<string | null>(null)
  const [playerEditOpen, setPlayerEditOpen] =
    useRecoilState(playerEditOpenState)
  const [selectedPlayer, setSelectedPlayer] =
    useRecoilState(selectedPlayerState)
  const [dragInProgress, setDragInProgress] = useState(false)
  const [recentCell, setRecentCell] = useState<Coordinates | null>(null)
  const stageRef = useRef<StageType>(null)

  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const l = localStorage.getItem('gridsly-map-layers')
    const h = localStorage.getItem('gridsly-map-sha')
    if (l) {
      try {
        setLayers(JSON.parse(l))
        setMapHash(l)
      } catch (ex) {
        setLayers(generateTestGrid())
        console.log(ex)
      }
    }
  }, [])

  useEffect(() => {
    ;(async function () {
      const h = await hash(JSON.stringify(layers))
      setMapHash((existingHash) => {
        if (existingHash !== h) {
          if (currentMap === 0) {
            localStorage.setItem('gridsly-map-layers', JSON.stringify(layers))
            localStorage.setItem('gridsly-map-sha', h)
          } else {
            localStorage.setItem(
              `gridsly-map-layers-${currentMap}`,
              JSON.stringify(layers)
            )
            localStorage.setItem(`gridsly-map-sha-${currentMap}`, h)
          }

          return h
        }

        return existingHash
      })
    })()
  }, [layers, currentMap])

  useEffect(() => {
    const reposition = () => {
      if (boxRef.current !== null) {
        const dx = boxRef.current.scrollLeft - PADDING
        const dy = boxRef.current.scrollTop - PADDING
        setTransformStr(`translate(${dx}px, ${dy}px)`)
        setStageX((x) => -dx)
        setStageY((y) => -dy)
      }
    }

    boxRef.current?.addEventListener('scroll', reposition)
    reposition()

    return () => {
      boxRef.current?.removeEventListener('scroll', reposition)
    }
  }, [boxRef.current])

  useLayoutEffect(() => {
    setWidth(window.innerWidth + PADDING * 2 * zoomVal)
    setHeight(window.innerHeight + PADDING * 2 * zoomVal)
  }, [zoomVal])

  useEffect(() => {
    setRectangleStarted(null)
    setRectangleEnd(null)
    setPlayerEditOpen(false)
    setRecentCell(null)
  }, [selectedTool])

  useEffect(() => {
    setLayers((ls) => {
      if (rectangleStarted && rectangleEnd) {
        ls[Layers.MOUSE].points = [
          {
            coordinates: {
              x:
                rectangleStarted.x < rectangleEnd.x
                  ? rectangleStarted.x
                  : rectangleEnd.x,
              y:
                rectangleStarted.y < rectangleEnd.y
                  ? rectangleStarted.y
                  : rectangleEnd.y
            },
            width: Math.abs(rectangleStarted.x - rectangleEnd.x) + 1,
            height: Math.abs(rectangleStarted.y - rectangleEnd.y) + 1,
            type: 'mouse-select'
          }
        ]

        return ls
      }

      ls[Layers.MOUSE].points = []
      return ls
    })
  }, [rectangleStarted, rectangleEnd])

  const mousePosOnGrid = (x: number, y: number) => {
    const gridX = Math.floor((x - bufferX) / (CELL_SCALAR * zoomVal))
    const gridY = Math.floor((y - bufferY) / (CELL_SCALAR * zoomVal))

    return [gridX, gridY]
  }

  const addSingleCell = (
    layer: number,
    gridX: number,
    gridY: number,
    type?: string | undefined,
    npcOverride?: Entity | undefined
  ) => {
    const cell = {
      coordinates: {
        x: gridX,
        y: gridY
      },
      width: 1,
      height: 1,
      type,
      entity:
        type === 'player'
          ? {
              name: 'PLAYER',
              color: '#000000',
              symbol: '@',
              type: 'player'
            }
          : undefined
    }

    if (type === 'npc') {
      if (npcOverride) {
        cell.entity = { ...npcOverride }
      } else {
        cell.entity = {
          name: 'NPC',
          color: '#805ad5',
          symbol: '>',
          type: 'npc'
        }
      }
    }

    setLayers((l) => {
      if (cellDoesNotExist(l[layer].points, { x: gridX, y: gridY })) {
        l[layer].points = [...l[layer].points, cell]
        return [...l]
      }

      return l
    })

    return cell
  }

  const addSingleSpace = (gridX: number, gridY: number) => {
    addSingleCell(Layers.SPACES, gridX, gridY)
  }

  const addSingleWall = (gridX: number, gridY: number) => {
    addSingleCell(Layers.BARRIERS, gridX, gridY, 'wall')
  }

  const addSingleObstacle = (gridX: number, gridY: number) => {
    addSingleCell(Layers.BARRIERS, gridX, gridY, 'obstacle')
  }

  const addSingleDoor = (gridX: number, gridY: number) => {
    setLayers((l) => {
      if (cellDoesNotExist(l[Layers.BARRIERS].points, { x: gridX, y: gridY })) {
        l[Layers.BARRIERS].points = [
          ...l[Layers.BARRIERS].points,
          {
            coordinates: {
              x: gridX,
              y: gridY
            },
            width: 1,
            height: 1,
            type: 'door',
            position: 'left'
          }
        ]
        return [...l]
      } else {
        for (let i = 0; i < l[Layers.BARRIERS].points.length; i++) {
          if (
            l[Layers.BARRIERS].points[i].coordinates.x === gridX &&
            l[Layers.BARRIERS].points[i].coordinates.y === gridY
          ) {
            l[Layers.BARRIERS].points[i].position = rotatePosition(
              l[Layers.BARRIERS].points[i].position
            )

            l[Layers.BARRIERS].points = [...l[Layers.BARRIERS].points]
            return [...l]
          }
        }
      }

      return [...l]
    })
  }

  const handlePossibleSelect = (gridX: number, gridY: number) => {
    if (
      selectedPlayer?.coordinates.x === gridX &&
      selectedPlayer?.coordinates.y === gridY
    ) {
      setSelectedPlayer(null as unknown as Point)
      return
    }

    const cell = findCell(layers[Layers.PLAYERS].points, { x: gridX, y: gridY })
    if (cell) {
      setSelectedPlayer({
        ...cell
      })
    } else if (selectedPlayer != null) {
      setLayers((l) => {
        for (let i = 0; i < l[Layers.PLAYERS].points.length; i++) {
          if (
            l[Layers.PLAYERS].points[i].coordinates.x ===
              selectedPlayer.coordinates.x &&
            l[Layers.PLAYERS].points[i].coordinates.y ===
              selectedPlayer.coordinates.y
          ) {
            if (
              cellDoesNotExist(l[Layers.PLAYERS].points, { x: gridX, y: gridY })
            ) {
              l[Layers.PLAYERS].points[i].coordinates = {
                x: gridX,
                y: gridY
              }
              setSelectedPlayer({
                ...l[Layers.PLAYERS].points[i]
              })
            }

            l[Layers.PLAYERS].points = [...l[Layers.PLAYERS].points]
            return [...l]
          }
        }

        return l
      })
    }
  }

  const addPlayer = useCallback(
    (gridX: number, gridY: number, type = 'player') => {
      if (!playerEditOpen) {
        const cell = addSingleCell(Layers.PLAYERS, gridX, gridY, type)
        setSelectedPlayer({
          ...cell
        })
        setPlayerEditOpen(true)
        return
      }

      // time to move the player
      setLayers((l) => {
        for (let i = 0; i < l[Layers.PLAYERS].points.length; i++) {
          if (
            l[Layers.PLAYERS].points[i].coordinates.x ===
              selectedPlayer.coordinates.x &&
            l[Layers.PLAYERS].points[i].coordinates.y ===
              selectedPlayer.coordinates.y
          ) {
            if (
              cellDoesNotExist(l[Layers.PLAYERS].points, { x: gridX, y: gridY })
            ) {
              l[Layers.PLAYERS].points[i].coordinates = {
                x: gridX,
                y: gridY
              }
              setSelectedPlayer({
                ...l[Layers.PLAYERS].points[i]
              })
            }

            l[Layers.PLAYERS].points = [...l[Layers.PLAYERS].points]
            return [...l]
          }
        }

        return l
      })
    },
    [playerEditOpen, selectedPlayer]
  )

  const addRectangleSpaces = () => {
    if (rectangleStarted && rectangleEnd) {
      setLayers((l) => {
        const width = Math.abs(rectangleStarted.x - rectangleEnd.x) + 1
        const height = Math.abs(rectangleStarted.y - rectangleEnd.y) + 1

        let x =
          rectangleStarted.x < rectangleEnd.x
            ? rectangleStarted.x
            : rectangleEnd.x
        let y =
          rectangleStarted.y < rectangleEnd.y
            ? rectangleStarted.y
            : rectangleEnd.y

        const newPoints = []
        for (let addX = 0; addX < width; addX++) {
          for (let addY = 0; addY < height; addY++) {
            if (
              cellDoesNotExist(l[Layers.SPACES].points, {
                x: x + addX,
                y: y + addY
              })
            ) {
              newPoints.push({
                coordinates: {
                  x: x + addX,
                  y: y + addY
                },
                width: 1,
                height: 1
              })
            }
          }
        }

        l[Layers.SPACES].points = [...l[Layers.SPACES].points, ...newPoints]
        return [...l]
      })
    }
  }

  const erase = (gridX: number, gridY: number) => {
    setLayers((l) => {
      for (let i = l.length - 1; i > -1; i--) {
        const initLength = l[i].points.length
        const newPoints = eraseCell(l[i].points, { x: gridX, y: gridY })

        if (newPoints.length !== initLength) {
          l[i].points = [...newPoints]
          break
        }
      }

      return [...l]
    })
  }

  const handleRectangleClick = useCallback(
    (gridX: number, gridY: number) => {
      if (!rectangleStarted) {
        setRectangleStarted({ x: gridX, y: gridY })
        return
      } else {
        if (gridX < labelZeroX) {
          setLabelZeroX(gridX);
        }

        if (gridY < labelZeroY) {
          setLabelZeroY(gridY);
        }

        addRectangleSpaces()
        setRectangleStarted(null)
        setRectangleEnd(null)
      }
    },
    [rectangleStarted, rectangleEnd, labelZeroX, labelZeroY]
  )

  const onGridMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (rectangleStarted) {
        const node = e.evt?.target as HTMLElement
        const { top, left } = node.getBoundingClientRect()
        const [gridX, gridY] = mousePosOnGrid(
          e.evt.clientX - left * 2,
          e.evt.clientY - top * 2
        )
        if (rectangleEnd?.x !== gridX || rectangleEnd?.y !== gridY) {
          setRectangleEnd({ x: gridX, y: gridY })
        }
      } else if (dragInProgress) {
        const node = e.evt?.target as HTMLElement
        const { top, left } = node.getBoundingClientRect()
        const [gridX, gridY] = mousePosOnGrid(
          e.evt.clientX - left * 2,
          e.evt.clientY - top * 2
        )

        if (recentCell?.x !== gridX || recentCell?.y !== gridY) {
          if (gridX < labelZeroX) {
            setLabelZeroX(gridX)
          }

          if (gridY < labelZeroY) {
            setLabelZeroY(gridY)
          }

          switch (selectedTool) {
            case 'single-wall':
              addSingleWall(gridX, gridY)
              break
            case 'eraser':
              erase(gridX, gridY)
              break
            case 'single-space':
              addSingleSpace(gridX, gridY)
              break
            default:
              break
          }

          setRecentCell({ x: gridX, y: gridY })
        }
      }
    },
    [rectangleStarted, rectangleEnd, dragInProgress, recentCell]
  )

  const onGridClick = (e: KonvaEventObject<MouseEvent>) => {
    if (selectedTool !== '') {
      setDragInProgress(true)
    }

    const node = e.evt?.target as HTMLElement
    const { top, left } = node.getBoundingClientRect()
    const [gridX, gridY] = mousePosOnGrid(
      e.evt.clientX - left * 2,
      e.evt.clientY - top * 2
    )
    if (selectedTool === 'single-space') {
      if (gridX < labelZeroX) {
        setLabelZeroX(gridX)
      }

      if (gridY < labelZeroY) {
        setLabelZeroY(gridY)
      }
    }

    switch (selectedTool) {
      case 'single-wall':
        addSingleWall(gridX, gridY)
        break
      case 'single-door':
        addSingleDoor(gridX, gridY)
        break
      case 'single-obstacle':
        addSingleObstacle(gridX, gridY)
        break
      case 'rectangle-space':
        handleRectangleClick(gridX, gridY)
        break
      case 'single-player':
        addPlayer(gridX, gridY, 'player')
        break
      case 'single-npc':
        addPlayer(gridX, gridY, 'npc')
        break
      case 'eraser':
        erase(gridX, gridY)
        break
      case 'single-space':
        addSingleSpace(gridX, gridY)
        break
      case 'movement':
        handlePossibleSelect(gridX, gridY)
      default:
        break
    }
  }

  const exportPNG = () => {
    if (stageRef?.current) {
      const uri = stageRef.current.toDataURL()
      FileSaver.saveAs(uri, 'Gridsly.png')
    }
  }

  const changeZoom = (zoomLevel: number) => () => {
    setZoomVal((z) =>
      z + zoomLevel > 0 && z + zoomLevel < 5.5 ? z + zoomLevel : z
    )
  }

  const updateSelectedPlayer = useCallback(
    (entity: PartialEntity | null, width?: number, height?: number) => {
      setLayers((l) => {
        const points = [...l[Layers.PLAYERS].points].map((point) => {
          if (
            point.coordinates.x === selectedPlayer.coordinates.x &&
            point.coordinates.y === selectedPlayer.coordinates.y
          ) {
            if (point.entity && entity) {
              point.entity = { ...point.entity, ...entity }
              setSelectedPlayer({
                ...selectedPlayer,
                entity: point.entity
              })
            } else if (width && height) {
              point.width = width
              point.height = height
              setSelectedPlayer({
                ...selectedPlayer,
                width,
                height
              })
            }
          }

          return point
        })

        l[Layers.PLAYERS].points = [...points]

        return [...l]
      })
    },
    [selectedPlayer]
  )

  const onGridDragEnd = () => {
    if (selectedTool !== '') {
      setDragInProgress(false)
    }
  }

  const selectMapToEdit = useCallback(
    (num: number) => {
      if (currentMap !== num) {
        let l = localStorage.getItem('gridsly-map-layers')
        let h = localStorage.getItem('gridsly-map-sha')
        if (num > 0) {
          l = localStorage.getItem(`gridsly-map-layers-${num}`)
          h = localStorage.getItem(`gridsly-map-sha-${num}`)
        }
        if (l) {
          try {
            setLayers(JSON.parse(l))
            setMapHash(l)
          } catch (ex) {
            setLayers(generateTestGrid())
            console.log(ex)
          }
        } else {
          setLayers(generateTestGrid())
        }

        setCurrentMap(num)
      }
    },
    [currentMap]
  )

  const duplicateSelectedNPC = useCallback(() => {
    let coords = {
      x: selectedPlayer.coordinates.x + 1,
      y: selectedPlayer.coordinates.y
    }
    if (cellDoesNotExist(layers[Layers.PLAYERS].points, coords)) {
      addSingleCell(
        Layers.PLAYERS,
        coords.x,
        coords.y,
        'npc',
        selectedPlayer.entity
      )
    }
  }, [selectedPlayer?.entity])

  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE()

  return (
    <Box
      ref={boxRef}
      overflow="auto"
      width={window.innerWidth}
      height={window.innerHeight}
      bgColor="gray.700"
    >
      {playerEditOpen && (
        <PlayerEditBar
          updateSelectedPlayer={updateSelectedPlayer}
          duplicateSelectedNPC={duplicateSelectedNPC}
        />
      )}
      <Box>
        <Stage
          width={width}
          height={height}
          x={stageX}
          y={stageY}
          transform={transformStr}
          onMouseDown={onGridClick}
          onMouseMove={onGridMouseMove}
          onMouseUp={onGridDragEnd}
          ref={stageRef}
          scaleX={zoomVal}
          scaleY={zoomVal}
        >
          <RecoilBridge>
            {layers[Layers.SPACES]?.points && <Layer key={layers[Layers.SPACES].name}>
              {layers[Layers.SPACES].points.map((point: Point) => (
                <PointComponent
                  point={point}
                  key={`${layers[Layers.SPACES].name}:${point.coordinates.x}:${point.coordinates.y}`}
                  labelZeroX={labelZeroX}
                  labelZeroY={labelZeroY}
                />
              ))}
            </Layer>}

            {layers[Layers.BARRIERS]?.points && <Layer key={layers[Layers.BARRIERS].name}>
              {layers[Layers.BARRIERS].points.map((point: Point) => (
                <PointComponent
                  point={point}
                  key={`${layers[Layers.BARRIERS].name}:${point.coordinates.x}:${point.coordinates.y}`}
                  labelZeroX={labelZeroX}
                  labelZeroY={labelZeroY}
                />
              ))}
            </Layer>}

            {layers[Layers.PLAYERS]?.points && <Layer key={layers[Layers.PLAYERS].name}>
              {layers[Layers.PLAYERS].points.map((point: Point) => (
                <PointComponent
                  point={point}
                  key={`${layers[Layers.PLAYERS].name}:${point.coordinates.x}:${point.coordinates.y}`}
                  labelZeroX={labelZeroX}
                  labelZeroY={labelZeroY}
                />
              ))}
            </Layer>}

            {layers[Layers.MOUSE]?.points && <Layer key={layers[Layers.MOUSE].name}>
              {layers[Layers.MOUSE].points.map((point: Point) => (
                <PointComponent
                  point={point}
                  key={`${layers[Layers.MOUSE].name}:${point.coordinates.x}:${point.coordinates.y}`}
                  labelZeroX={labelZeroX}
                  labelZeroY={labelZeroY}
                />
              ))}
            </Layer>}
          </RecoilBridge>
        </Stage>
      </Box>

      <MapControls
        exportPNG={exportPNG}
        changeZoom={changeZoom}
        zoom={zoomVal}
        selectMapToEdit={selectMapToEdit}
        currentMap={currentMap}
      />
    </Box>
  )
}
