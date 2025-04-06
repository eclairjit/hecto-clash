package cache

import (
	"github.com/redis/go-redis/v9"
)

const REDIS_SORTED_SET = "players_leaderboard"

func NewRedisClient(addr, pw string, db int) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: pw,
		DB:       db,
	})
}