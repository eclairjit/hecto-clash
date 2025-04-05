package ws

import (
	"fmt"
	"net/http"

	"github.com/eclairjit/hecto-clash-hf/game-server/pkg/hectoc"
	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

type Handler struct {
	hub *Hub
}

func NewHandler(h *Hub) *Handler {
	return &Handler{
		hub: h,
	}
}

type CreateRoomReq struct {
	ID   string `json:"id"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Handler) JoinRoom(w http.ResponseWriter, r *http.Request) {
    // Parse the room ID from the URL
    roomID := chi.URLParam(r, "roomId")

    clientID := r.URL.Query().Get("userId")

    // Upgrade the connection to WebSocket
    conn, err := upgrader.Upgrade(w, r, nil)
	
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Create a new client
    cl := &Client{
        Conn:     conn,
        Message:  make(chan *Message, 10),
        ID:       clientID,
        RoomID:   roomID,
    }

    // Register the client with the hub
    h.hub.Register <- cl

    // Start handling WebSocket messages
    go cl.writeMessage()
    cl.readMessage(h.hub)
}

func (h *Hub) handleSubmission(c *Client, msg Message) {
	if room, ok := h.Rooms[msg.RoomID]; ok {
		verified, err := hectoc.Verify(msg.Content.(string))

		if verified {
			// Notify both users and end the game
			for _, cl := range room.Clients {
				cl.Message <- &Message{
					Type:    MESSAGE_TYPE_END,
					Content: "Game over! A user has submitted the correct answer.",
					RoomID:  msg.RoomID,
				}
				close(cl.Message)
			}
			delete(h.Rooms, msg.RoomID)
		} else if err != nil {
			// Notify only the submitting user
			c.Message <- &Message{
				Type:   MESSAGE_TYPE_ERROR,
				Content: fmt.Sprintf("Error verifying submission: %v", err),
				RoomID: msg.RoomID,
			}
		} else {
			// Notify only the submitting user
			c.Message <- &Message{
				Type:    MESSAGE_TYPE_WRONG_SUBMISSION,
				Content: fmt.Sprintf("Incorrect submission. Try again. Error: %v", err),
				RoomID:  msg.RoomID,
			}
		}
	}
}