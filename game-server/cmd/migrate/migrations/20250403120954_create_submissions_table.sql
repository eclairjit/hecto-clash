-- +goose Up
CREATE TABLE IF NOT EXISTS submissions (
    game_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    submission TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT now()
);
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS submissions;
-- +goose StatementBegin
-- +goose StatementEnd
