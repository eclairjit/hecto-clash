package store

import (
	"context"
	"database/sql"
)

type PlayerStore struct {
	db *sql.DB
}

type Player struct {
	GameID int64 `json:"game_id"`
	PlayerID int64 `json:"player_id"`
	CreatedAt string `json:"created_at"`
}

func (s *PlayerStore) Create(ctx context.Context, player *Player) error {
	query := `
		INSERT INTO players (game_id, player_id)
		VALUES ($1, $2)
		RETURNING created_at;
	`

	err := s.db.QueryRowContext(
		ctx,
		query,
		player.GameID,
		player.PlayerID,
	).Scan(&player.CreatedAt)

	if err != nil {
		return err
	}

	return nil
}