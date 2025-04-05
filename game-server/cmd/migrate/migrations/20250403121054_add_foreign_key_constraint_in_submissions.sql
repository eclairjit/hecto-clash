-- +goose Up
-- +goose StatementBegin
ALTER TABLE submissions
ADD CONSTRAINT fk_submissions_player_id
FOREIGN KEY (player_id)
REFERENCES users (id)
ON DELETE CASCADE;

ALTER TABLE submissions
ADD CONSTRAINT fk_submissions_game_id
FOREIGN KEY (game_id)
REFERENCES games (id)
ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE submissions
DROP CONSTRAINT fk_submissions_player_id;

ALTER TABLE submissions
DROP CONSTRAINT fk_submissions_game_id;
-- +goose StatementEnd
