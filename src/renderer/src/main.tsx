import './assets/base.css'

import { signal } from '@preact/signals-react'
import ReactDOM from 'react-dom/client'
import React from 'react'
import App from './App'

interface Duration {
  min: number;
  max: number;
  avg: number;
}

export const server = signal<string>("");
export const setServer = (new_server: string) => {
  server.value = new_server;
}
export const reason = signal<string>("");
export const setReason = (new_reason: string) => {
  reason.value = new_reason;
}
export const duration = signal<Duration>({ min: 1, max: 1, avg: 1 });
export const setDuration = (new_duration: Duration) => {
  duration.value = new_duration;
}

let player_list: Player[] = [];

if (window.api.isDev) {
  player_list = [{ displayName: 'Ⱥ Smiggy', playfabId: '6F33D568A08FF682' }];
}

export const players = signal<Player[]>(player_list);
export const setPlayers = (new_players: Player[]) => {
  players.value = new_players;
}
export const secondsLeft = signal<number>(60);
export const setSecondsLeft = (new_secondsLeft: number) => {
  secondsLeft.value = new_secondsLeft;
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)