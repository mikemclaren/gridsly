import { Layer } from 'react-konva'
import { LayerType } from './Map/Map'
import { Point, PointComponent } from './Point'

export interface MapGridProps {
  width: number
  height: number
  zoom: number
  layers: LayerType[]
  labelZeroX: number
  labelZeroY: number
}

const MapGrid = ({
  width,
  height,
  zoom,
  layers,
  labelZeroX,
  labelZeroY
}: MapGridProps) => {
  return (
    <>
      {layers.map((layer) => (
        <Layer key={layer.name}>
          {layer.points.map((point: Point) => (
            <PointComponent
              point={point}
              key={`${layer.name}:${point.coordinates.x}:${point.coordinates.y}`}
              zoom={zoom}
              labelZeroX={labelZeroX}
              labelZeroY={labelZeroY}
            />
          ))}
        </Layer>
      ))}
    </>
  )
}

export default MapGrid
