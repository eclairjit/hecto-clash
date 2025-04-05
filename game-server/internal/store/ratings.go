package store

import (
	"context"
	"database/sql"
)

type RatingStore struct {
	db *sql.DB
}

type Rating struct {
	UserID int64 `json:"user_id"`
	GameID int64 `json:"game_id"`
	RatingAfter int   `json:"rating_after"`
	CreatedAt string `json:"created_at"`
}

func (s *RatingStore) Create(ctx context.Context, rating *Rating) error {
	query := `
		INSERT INTO ratings (user_id, game_id, rating_after)
		VALUES ($1, $2, $3);
	`

	result, err := s.db.ExecContext(
		ctx,
		query,
		rating.UserID,
		rating.GameID,
		rating.RatingAfter,
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