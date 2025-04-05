-- +goose Up
CREATE TABLE IF NOT EXISTS players (
    game_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS players;
-- +goose StatementBegin
-- +goose StatementEnd
