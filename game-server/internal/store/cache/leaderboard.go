package cache

import (
	"context"
	"errors"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type LeaderboardStore struct {
	rdb *redis.Client
}

func (s *LeaderboardStore) Add(ctx context.Context, playerID int64, rating int) error {
	cacheKey := fmt.Sprintf("userId-%d", playerID)

	username, err := s.rdb.Get(ctx, cacheKey).Result()

	if err == redis.Nil {
		return errors.New("username not found")
	} else if err != nil {
		return err
	}

	if username == "" {
		return errors.New("username not found")
	}

	// Add the player to the sorted set with their rating
	if err := s.rdb.ZAdd(ctx, REDIS_SORTED_SET, redis.Z{
		Score:  float64(rating),
		Member: username,
	}).Err(); err != nil {
		return err
	}

	return nil
}