package ws

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"

	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store"
	"github.com/eclairjit/hecto-clash-hf/game-server/pkg/hectoc"
	"github.com/gorilla/websocket"
)

// type Handler struct {
// 	hub *Hub
// }

// func NewHandler(h *Hub) *Handler {
// 	return &Handler{
// 		hub: h,
// 	}
// }

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

func Upgrade(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	return upgrader.Upgrade(w, r, nil)
}

// func (h *Handler) JoinRoom(w http.ResponseWriter, r *http.Request, clientID string, roomID string)  {
//     // Upgrade the connection to WebSocket
//     conn, err := upgrader.Upgrade(w, r, nil)
	
//     if err != nil {
//         http.Error(w, err.Error(), http.StatusBadRequest)
//         return
//     }

//     // Create a new client
//     cl := &Client{
//         Conn:     conn,
//         Message:  make(chan *Message, 10),
//         ID:       clientID,
//         RoomID:   roomID,
//     }

//     // Register the client with the hub
//     h.hub.Register <- cl

//     // Start handling WebSocket messages
//     go cl.writeMessage()
//     cl.readMessage(h.hub)
// }

func isNumber(char string) bool {
    return regexp.MustCompile(`\d`).MatchString(char)
}

func countNumbers(sequence string) int {
    count := 0
    for _, char := range sequence {
        if isNumber(string(char)) {
            count++
        }
    }
    return count
}

func validateSequence(hectocSeq, submittedSeq string) bool {
    // Ensure the submitted sequence contains exactly the same number of numeric characters as the Hectoc sequence.
    if countNumbers(submittedSeq) != len(hectocSeq) {
        return false
    }

    
    i, j := 0, 0

    for i < len(hectocSeq) && j < len(submittedSeq) {
        if isNumber(string(hectocSeq[i])) {
            if isNumber(string(submittedSeq[j])) {
                
                if hectocSeq[i] != submittedSeq[j] {
                    return false
                }
                i++
                j++
            } else {
                
                j++
            }
        } else {
            
            i++
        }
    }

    return i == len(hectocSeq)
}

func (h *Hub) handleSubmission(c *Client, msg Message) {
	if room, ok := h.Rooms[msg.RoomID]; ok {
		hectocSeq := room.Puzzle.Problem
		submittedSeq := msg.Content.(string)

		if !validateSequence(hectocSeq, submittedSeq) {
			c.Message <- &Message{
				Type:    MESSAGE_TYPE_WRONG_SUBMISSION,
				Content: "Invalid submission format. Please ensure your submission matches the Hectoc sequence.",
				RoomID:  msg.RoomID,
			}
			return
		}

		playerID, err := strconv.ParseInt(c.ID, 10, 64)

		if err != nil {
			c.Message <- &Message{
				Type:    MESSAGE_TYPE_ERROR,
				Content: "Invalid player ID.",
				RoomID:  msg.RoomID,
			}
			return
		}

		submission := &store.SubmissionStruct{
			PlayerID:   playerID,
			Submission: submittedSeq,
		}

		verified, err := hectoc.Verify(msg.Content.(string))

		if verified {
			submission.IsCorrect = true

			if h.OnSubmission != nil {
				h.OnSubmission(msg.RoomID, submission)
			}

			var opponentID int64

			// Notify both users and end the game
			for _, cl := range room.Clients {
				if cl.ID == c.ID {
					cl.Message <- &Message{
						Type:    MESSAGE_TYPE_CORRECT_SUBMISSION,
						Content: "Congratulations! You have submitted the correct answer.",
						RoomID:  msg.RoomID,
					}
				} else {
					opponentID, err = strconv.ParseInt(cl.ID, 10, 64)

					if err != nil {
						cl.Message <- &Message{
							Type:    MESSAGE_TYPE_ERROR,
							Content: "Invalid opponent ID.",
							RoomID:  msg.RoomID,
						}
						continue
					}

					cl.Message <- &Message{
						Type:    MESSAGE_TYPE_END,
						Content: "Game over! Your opponent has submitted the correct answer.",
						RoomID:  msg.RoomID,
					}
				}

				close(cl.Message)

				if h.OnEnding != nil {
					h.OnEnding(msg.RoomID, playerID, opponentID)
				}
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
			submission.IsCorrect = false
			
			if h.OnSubmission != nil {
				h.OnSubmission(msg.RoomID, submission)
			}

			// Notify only the submitting user
			c.Message <- &Message{
				Type:    MESSAGE_TYPE_WRONG_SUBMISSION,
				Content: fmt.Sprintf("Incorrect submission. Try again. Error: %v", err),
				RoomID:  msg.RoomID,
			}
		}
	}
}