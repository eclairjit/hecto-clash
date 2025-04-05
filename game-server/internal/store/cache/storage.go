package cache

import (
	"context"

	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store"
	"github.com/redis/go-redis/v9"
)

type Storage struct {
	Games interface {
		Get(context.Context, string) (int64, error)
		Set(context.Context, *store.Game) error
		Delete(context.Context, string) error
	} 
}

func NewRedisStorage(rdb *redis.Client) Storage {
	return Storage {
		Games: &GamesStore{
			rdb: rdb,
		},
	}
}