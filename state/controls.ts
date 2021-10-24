import { atom } from "recoil";

export const selectedToolState = atom({
  key: 'selectedToolState',
  default: 'single-space'
})

export const playerEditOpenState = atom({
  key: 'playerEditOpenState',
  default: false
})

export const selectedPlayerState = atom({
  key: 'selectedPlayerState',
  default: null as unknown as import("../components/Point").Point
})