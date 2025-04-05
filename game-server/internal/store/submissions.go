package store

import (
	"context"
	"database/sql"
)

type SubmissionStore struct {
	db *sql.DB
}

type SubmissionStruct struct {
	GameID int64  `json:"game_id"`
	PlayerID int64 `json:"player_id"`
	Submission string `json:"submission"`
	IsCorrect bool `json:"is_correct"`
	SubmittedAt string `json:"submitted_at"`
}

func (s *SubmissionStore) Create(ctx context.Context, submission *SubmissionStruct) error {
	query := `
		INSERT INTO submissions (game_id, player_id, submission, is_correct)
		VALUES ($1, $2, $3, $4);
	`
	result, err := s.db.ExecContext(
		ctx,
		query,
		submission.GameID,
		submission.PlayerID,
		submission.Submission,
		submission.IsCorrect,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}