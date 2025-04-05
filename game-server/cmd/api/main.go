package main

import (
	"log"

	"github.com/eclairjit/hecto-clash-hf/game-server/internal/db"
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/env"
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store"
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store/cache"
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/ws"
	"github.com/eclairjit/hecto-clash-hf/game-server/pkg/hectoc"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"golang.org/x/net/context"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	cfg := config{
		addr: env.GetString("ADDR", ":8080"),
		db: dbConfig{
			addr: env.GetString("DB_ADDR", "postgres://admin:password@localhost/social?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime: env.GetString("DB_MAX_IDLE_TIME", "15m"),
		},

		env: env.GetString("ENV", "development"),

		redisCfg: redisConfig{
			addr: 		env.GetString("REDIS_ADDR", "localhost:6379"),
			pw: 		env.GetString("REDIS_PW", ""),
			db: 		env.GetInt("REDIS_DB", 0),
			enabled: 	env.GetBool("REDIS_ENABLED", false),
		},
	}

	db, err := db.New(
		cfg.db.addr,
		cfg.db.maxOpenConns,
		cfg.db.maxIdleConns,
		cfg.db.maxIdleTime,
	)

	if err != nil {
		log.Panic(err)
	}

	defer db.Close()

	log.Println("Database connection established.")

	// Cache
	var rdb *redis.Client

	if cfg.redisCfg.enabled {
		rdb = cache.NewRedisClient(
			cfg.redisCfg.addr,
			cfg.redisCfg.pw,
			cfg.redisCfg.db,
		)

		log.Println("Redis connection established.")
	}
	
	app := &application{
		config: cfg,
		cacheStorage: cache.NewRedisStorage(rdb),
		store: store.NewStorage(db),
	}

	hub := ws.NewHub(func (roomID string) {
		ctx := context.Background()

		if err := app.cacheStorage.Games.Delete(ctx, roomID); err != nil {
			log.Printf("Failed to delete room %s from Redis: %v\n", roomID, err)
		} else {
			log.Printf("Deleted room %s from Redis\n", roomID)
		}
	}, 
	func(roomID string, puzzle *hectoc.Hectoc) {
		ctx := context.Background()

		gameID, err := app.cacheStorage.Games.Get(ctx, roomID)

		if err == redis.Nil {
			log.Printf("Room %s not found in Redis\n", roomID)
			return
		} else if err != nil {
			log.Printf("Failed to get room %s from Redis: %v\n", roomID, err)
			return
		}

		if err := app.store.Games.CreatePuzzle(ctx, gameID, puzzle); err != nil {
			log.Printf("Failed to set room %s in Redis: %v\n", roomID, err)
		} else {
			log.Printf("Set room %s in Redis\n", roomID)
		}
	},
	func(roomID string, submission *store.SubmissionStruct) {
		ctx := context.Background()

		gameID, err := app.cacheStorage.Games.Get(ctx, roomID)

		if err == redis.Nil {
			log.Printf("Room %s not found in Redis\n", roomID)
			return
		} else if err != nil {
			log.Printf("Failed to get room %s from Redis: %v\n", roomID, err)
			return
		}

		submission.GameID = gameID

		if err := app.store.Submissions.Create(ctx, submission); err != nil {
			log.Printf("Failed to create submission for room %s: %v\n", roomID, err)
			return
		}

		log.Printf("Created submission for room %s\n", roomID)

	},
	)

	app.hub = hub
	
	go hub.Run()

	mux := app.mount()

	log.Fatal(app.run(mux))
}