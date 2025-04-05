package cache

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store"
	"github.com/redis/go-redis/v9"
)

type GamesStore struct {
	rdb *redis.Client
}

const GameExpTime = time.Minute

func (s *GamesStore) Get(ctx context.Context, roomID string) (int64, error) {
	cacheKey := fmt.Sprintf("room-%s", roomID)

	data, err := s.rdb.Get(ctx, cacheKey).Result()

	if err == redis.Nil {
		return -1, nil
	} else if err != nil {
		return -1, err
	}

	if data == "" {
		return -1, nil
	}

	dataAsInt64, err := strconv.ParseInt(data, 10, 64)

	if err != nil {
		return -1, err
	}

	return dataAsInt64, nil
}

func (s *GamesStore) Set(ctx context.Context, game *store.Game) error {
	cacheKey := fmt.Sprintf("room-%s", game.RoomID)

	val := strconv.FormatInt(game.ID, 10)

	return s.rdb.SetEx(ctx, cacheKey, val, GameExpTime).Err()
}

func (s *GamesStore) Delete(ctx context.Context, roomID string) error {
	cacheKey := fmt.Sprintf("room-%s", roomID)

	return s.rdb.Del(ctx, cacheKey).Err()
}