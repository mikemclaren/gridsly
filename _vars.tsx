export const CELL_SCALAR = 64;

export const calculateTextColorForBackground = (hexString: string) => {
  const threshold = 149
  const r = parseInt(hexString[1] + hexString[2], 16)
  const g = parseInt(hexString[3] + hexString[4], 16)
  const b = parseInt(hexString[5] + hexString[6], 16)

  return (r * 0.299 + g * 0.587 + b *0.114) > threshold ? '#000000' : '#FFFFFF'
}