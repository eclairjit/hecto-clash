-- +goose Up
ALTER TABLE games
ADD CONSTRAINT fk_games_user_id
FOREIGN KEY (winner_id) REFERENCES users(id)
ON DELETE SET NULL;
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
ALTER TABLE games
DROP CONSTRAINT fk_games_user_id;
-- +goose StatementBegin
-- +goose StatementEnd
