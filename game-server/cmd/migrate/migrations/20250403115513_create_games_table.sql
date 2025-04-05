-- +goose Up
CREATE TABLE IF NOT EXISTS games (
    id BIGSERIAL PRIMARY KEY,
    roomId char(6) NOT NULL CHECK (roomId ~ '^[0-9]{6}$'),
    hectoc_puzzle CHAR(6) NOT NULL CHECK (hectoc_puzzle ~ '^[1-9]{6}$'),
    winner_id BIGINT,
    winning_submission TEXT [],
    correct_solution TEXT,
    game_state VARCHAR(11) NOT NULL CHECK (game_state IN ('waiting', 'in_progress', 'completed')) DEFAULT 'waiting',
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT now()
);
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS games;
-- +goose StatementBegin
-- +goose StatementEnd
