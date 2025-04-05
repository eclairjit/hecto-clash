package main

import (
	"net/http"
	"strconv"

	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store"
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/ws"
	"github.com/go-chi/chi/v5"
	"golang.org/x/net/context"
)

func (app *application) joinRoomHandler(w http.ResponseWriter, r *http.Request) {
	roomID := chi.URLParam(r, "roomId")

	if roomID == "" {
		writeJSONError(w, http.StatusBadRequest, "room ID is required")	
		return
	}

	clientID := r.URL.Query().Get("userId")

	if clientID == "" {
		writeJSONError(w, http.StatusBadRequest, "user ID is required")
		return
	}

	ctx := context.Background()

	// Get the gameID from the cache
	gameID, err := app.cacheStorage.Games.Get(ctx, roomID)


	if err != nil {
		writeJSONError(w, http.StatusNotFound, "room not found")
		return
	}

	playerID, err := strconv.ParseInt(clientID, 10, 64)

	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid user ID")
		return
	}

	player := &store.Player {
		GameID:   gameID,
		PlayerID: playerID,
	}

	ctx = r.Context()

	if err := app.store.Players.Create(ctx, player); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to create player")
		return
	}

	// Upgrade the connection to a WebSocket
	conn, err := ws.Upgrade(w, r)

	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "failed to upgrade connection")
		return
	}

	cl := &ws.Client{
		Conn:     conn,
        Message:  make(chan *ws.Message, 10),
        ID:       clientID,
        RoomID:   roomID,
	}

	// Register the client with the hub
	app.hub.Register <- cl

	// Start handling WebSocket messages
	go cl.WriteMessage()
	cl.ReadMessage(app.hub)
}