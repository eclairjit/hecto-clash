-- +goose Up
-- +goose StatementBegin
ALTER TABLE ratings
ADD CONSTRAINT fk_ratings_user_id
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE ratings
ADD CONSTRAINT fk_ratings_game_id
FOREIGN KEY (game_id)
REFERENCES games(id)
ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE ratings
DROP CONSTRAINT fk_ratings_user_id;

ALTER TABLE ratings
DROP CONSTRAINT fk_ratings_game_id;
-- +goose StatementEnd
