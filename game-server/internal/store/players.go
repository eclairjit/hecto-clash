package store

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Player struct {
	ID 			int64 			`json:"id"`
	Conn 		*websocket.Conn `json:"-"`
	GameID 		string 			`json:"game_id"`
	Username 	string 			`json:"username"`
	mu 			sync.Mutex 		`json:"-"`
}

var (
	Players = make(map[string]*Player)
	PlayersMu sync.RWMutex
)