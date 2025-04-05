package main

import (
	"log"
	"net/http"
	"time"

	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store"
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/store/cache"
	"github.com/eclairjit/hecto-clash-hf/game-server/internal/ws"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

const version = "0.0.1"

type dbConfig struct {
	addr 			string
	maxOpenConns 	int
	maxIdleConns 	int
	maxIdleTime 	string
}

type redisConfig struct {
	addr 	string
	pw 		string
	db 		int
	enabled bool
}

type config struct {
	addr 		string
	db 			dbConfig
	env 		string
	redisCfg 	redisConfig
}

type application struct {
	config 			config
	cacheStorage 	cache.Storage
	hub 			*ws.Hub
	store 			store.Storage
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(time.Minute))
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins:   []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	  }))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		r.Get("/ws/rooms/{roomId}/join", app.joinRoomHandler)
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	srv := &http.Server {
		Addr:		 	app.config.addr,
		Handler: 	 	mux,
		ReadTimeout:  	10 * time.Second,
		WriteTimeout: 	30 * time.Second,
		IdleTimeout:	time.Minute,
	}

	log.Printf("Server of version: %s has started on port %s", version, app.config.addr)

	return srv.ListenAndServe()
}