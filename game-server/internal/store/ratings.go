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

func (s *RatingStore) UpdateRatings(ctx context.Context, person1Rating *Rating, person2Rating *Rating) error {
	ratings_table_query := `
		INSERT INTO ratings (user_id, game_id, rating_after)
		VALUES ($1, $2, $3);
	`

	users_table_query := `
		UPDATE users
		SET current_rating = $1
		WHERE id = $2;
	`

	tx, err := s.db.BeginTx(ctx, nil)

	if err != nil {
		return err
	}

	defer tx.Rollback()

	result, err := tx.ExecContext(
		ctx,
		ratings_table_query,
		person2Rating.UserID,
		person2Rating.GameID,
		person2Rating.RatingAfter,
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

	result, err = tx.ExecContext(
		ctx,
		ratings_table_query,
		person1Rating.UserID,
		person1Rating.GameID,
		person1Rating.RatingAfter,
	)

	if err != nil {
		return err
	}

	rowsAffected, err = result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	_, err = tx.ExecContext(
		ctx,
		users_table_query,
		person1Rating.RatingAfter,
		person1Rating.UserID,
	)

	if err != nil {
		return err
	}

	_, err = tx.ExecContext(
		ctx,
		users_table_query,
		person2Rating.RatingAfter,
		person2Rating.UserID,
	)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (s *RatingStore) GetRatingByID(ctx context.Context, userID int64) (int, error) {
	query := `
		SELECT current_rating AS rating from users
		WHERE id = $1;
	`

	rows, err := s.db.QueryContext(ctx, query, userID)

	if err != nil {
		return -1, err
	}

	defer rows.Close()

	if !rows.Next() {
		return -1, sql.ErrNoRows
	}

	var rating int

	if err := rows.Scan(&rating); err != nil {
		return -1, err
	}

	if err := rows.Err(); err != nil {
		return -1, err
	}

	return rating, nil
	
}