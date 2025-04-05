package store

import (
	"context"
	"database/sql"
	"errors"

	"github.com/eclairjit/hecto-clash-hf/game-server/pkg/hectoc"
	"github.com/lib/pq"
)

// Curent status of the game
type GameStatus string

// HectoSequence represents the sequence of numbers in the game
type HectoSequence string

// GameStatus values
const (
	STATUS_WAITING GameStatus = "waiting"
	STATUS_IN_PROGRESS GameStatus = "in_progress"
	STATUS_CANCELLED GameStatus = "cancelled"
	STATUS_COMPLETED GameStatus = "completed"
)

type GameStore struct {
	db *sql.DB
}

type Game struct {
	ID int64 `json:"id"`
	RoomID string `json:"room_id"`
	HectocPuzzle string `json:"hectoc_puzzle"`
	WinnerID int64 `json:"winner_id"`
	WinningSubmission string `json:"winning_submission"`
	CorrectSolution []string `json:"correct_solution"`
	GameState string `json:"game_state"`
	CreatedAt string `json:"created_at"`
}

func (s *GameStore) CreatePuzzle(ctx context.Context, gameID int64, puzzle *hectoc.Hectoc) error {
	query := `
		UPDATE games
		SET hectoc_puzzle = $1, game_state = $2, correct_solutions = $3
		WHERE id = $4
		RETURNING game_state, created_at;
	`
	result, err := s.db.ExecContext(
		ctx,
		query,
		puzzle.Problem,
		STATUS_IN_PROGRESS,
		pq.Array(puzzle.Solutions),
		gameID,
	)

	if err != nil {
		switch {
			case errors.Is(err, sql.ErrNoRows):
				return ErrNotFound
			default:
				return err
		}
	}

	rowsAffected, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *GameStore) UpdateWinnerDetails(ctx context.Context, game *Game) error {
	query := `
		UPDATE games
		SET winner_id = $1, winning_submission = $2
		WHERE id = $3;
	`
	res, err := s.db.ExecContext(
		ctx,
		query,
		game.WinnerID,
		game.WinningSubmission,
		game.ID,
	)

	if err != nil {
		switch {
			case errors.Is(err, sql.ErrNoRows):
				return ErrNotFound
			default:
				return err
		}
	}

	rowsAffected, err := res.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}