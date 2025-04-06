package ws

import (
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store"
	"github.com/eclairjit/hecto-clash-hf/game-server/pkg/hectoc"
)

type Room struct {
	ID      string             `json:"id"`
	Clients map[string]*Client `json:"clients"`
    Puzzle  *hectoc.Hectoc     `json:"puzzle"`
}

type Hub struct {
	Rooms       map[string]*Room
	Register    chan *Client
	Unregister  chan *Client
	Broadcast   chan *Message
    OnRoomEmpty func(roomID string)
    OnPuzzleCreated func(roomID string, puzzle *hectoc.Hectoc)
    OnSubmission func(roomID string, submission *store.SubmissionStruct)
    OnEnding func(roomID string, winnerID int64, loserID int64)
}

func NewHub(
    onRoomEmpty func(roomID string),
    onPuzzleCreated func(roomID string, puzzle *hectoc.Hectoc),
    onSubmission func(roomID string, submission *store.SubmissionStruct),
    onEnding func(roomID string, winnerID int64, loserID int64)) *Hub{
	return &Hub{
		Rooms:      make(map[string]*Room),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message, 5),
        OnRoomEmpty: onRoomEmpty,
        OnPuzzleCreated: onPuzzleCreated,
        OnSubmission: onSubmission,
        OnEnding: onEnding,
	}
}

func (h *Hub) Run() {
    for {
        select {
        case cl := <-h.Register:
            // Check if the room exists
            if room, ok := h.Rooms[cl.RoomID]; ok {
                // Check if the room already has 2 clients
                if len(room.Clients) >= 2 {
                    // Notify the client that the room is full
                    cl.Message <- &Message{
                        Type:    MESSAGE_TYPE_ROOM_FULL,
                        Content: "Room is full",
                        RoomID:  cl.RoomID,
                    }
                    close(cl.Message)
                    continue
                }

                // Add the client to the room
                room.Clients[cl.ID] = cl

                cl.Message <- &Message{
                    Type:     MESSAGE_TYPE_JOIN_SUCCESS,
                    Content:  "Joined the room successfully",
                    RoomID:   cl.RoomID,
                }

                if len(room.Clients) == 2 {
                    // assign a puzzle to the clients
                    hectocSeq := hectoc.Generate()

                    room.Puzzle = hectocSeq

                    if h.OnPuzzleCreated != nil {
                        h.OnPuzzleCreated(cl.RoomID, hectocSeq)
                    }

                    for _, client := range room.Clients {
                        client.Message <- &Message{
                            Type:     MESSAGE_TYPE_PUZZLE_ASSIGN,
                            Content:  hectocSeq,
                            RoomID:   cl.RoomID,
                            SenderID: client.ID,
                        }
                    }
                }
            } else {
                // If the room doesn't exist, create it and add the client
                h.Rooms[cl.RoomID] = &Room{
                    ID:      cl.RoomID,
                    Clients: map[string]*Client{cl.ID: cl},
                }

                cl.Message <- &Message{
                    Type:     MESSAGE_TYPE_ROOM_CREATED,
                    Content:  "Room created successfully",
                    RoomID:   cl.RoomID,
                }
            }

        case cl := <-h.Unregister:
            // Handle client unregistration
            if room, ok := h.Rooms[cl.RoomID]; ok {
                if _, ok := room.Clients[cl.ID]; ok {
                    delete(room.Clients, cl.ID)
                    
                    // Notify the client that they have left the room
                    cl.Message <- &Message{
                        Type:     MESSAGE_TYPE_LEAVE_SUCCESS,
                        Content:  "Left the room successfully",
                        RoomID:   cl.RoomID, 
                    }

                    close(cl.Message)

                    // If the room is empty, delete it
                    if len(room.Clients) == 0 {
                        // If the room is empty, delete it
                        delete(h.Rooms, cl.RoomID)

                        if h.OnRoomEmpty != nil {
                            h.OnRoomEmpty(cl.RoomID)
                        }

                    } else {
                       // Notify the remaining client that the other client has left
                       for _, remainingClient := range room.Clients {
                            remainingClient.Message <- &Message{
                                Type:     MESSAGE_TYPE_OPPONENT_LEFT,
                                Content:  "Your opponent left the room",
                                RoomID:   cl.RoomID,
                            }
                        }
                    }

                }
            }

        case m := <-h.Broadcast:
            // Broadcast messages to all clients in the room except the sender
            if room, ok := h.Rooms[m.RoomID]; ok {
                for _, cl := range room.Clients {
                    // if cl.ID == m.SenderID {
                    //     continue
                    // }
                    cl.Message <- m
                }
            }
        }
    }
}

