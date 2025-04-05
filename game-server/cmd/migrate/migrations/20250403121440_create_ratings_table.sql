-- +goose Up
CREATE TABLE IF NOT EXISTS ratings (
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    rating_after INT NOT NULL CHECK (rating_after >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS ratings;
-- +goose StatementBegin
-- +goose StatementEnd
