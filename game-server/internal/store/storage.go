package store

import (
	"context"
	"database/sql"
	"errors"

	"github.com/eclairjit/hecto-clash-hf/game-server/pkg/hectoc"
)

var (
	ErrNotFound = errors.New("resource not found")
)

type Storage struct {
	Players interface {
		Create(context.Context, *Player) error
	}

	Games interface {
		CreatePuzzle(context.Context, int64, *hectoc.Hectoc) error
		UpdateWinnerDetails(context.Context, *Game) error
	}

	Submissions interface {
		Create(context.Context, *SubmissionStruct) error
	}

	Ratings interface {
		UpdateRatings(context.Context, *Rating, *Rating) error
		GetRatingByID(context.Context, int64) (int, error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage {
		Players: &PlayerStore{db},
		Games: &GameStore{db},
		Submissions: &SubmissionStore{db},
		Ratings: &RatingStore{db},
	}
}