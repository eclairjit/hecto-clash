package store

// Curent status of the game
type GameStatus string

// HectoSequence represents the sequence of numbers in the game
type HectoSequence string

// GameStatus values
const (
	StatusWaiting GameStatus = "waiting"
	StatusInProgress GameStatus = "in_progress"
	StatusCompleted GameStatus = "completed"
)

// type Game struct {
// 	ID int64 `json:"id"`
// 	RoomCode string `json:"room_code"`
// 	Players []*Player `json:"players"`
// 	Status GameStatus `json:"status"`
// 	StartedAt string `json:"started_at"`
// 	CompletedAt string `json:"completed_at"`
// 	WinnerID int64 `json:"winner_id"`
// 	HectoSeq HectoSequence `json:"hecto_seq"`
// 	Solution string `json:"solution"`
// 	PlayerCount int `json:"player_count"`
// 	mu sync.Mutex `json:"-"`
// 	SubmissionMu sync.Mutex `json:"-"`
// 	Submissions []*Submission `json:"submissions"`
// }