-- +goose Up
ALTER TABLE ratings
ADD CONSTRAINT pk_ratings
PRIMARY KEY (game_id, user_id);
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
ALTER TABLE ratings
DROP CONSTRAINT pk_ratings;
-- +goose StatementBegin
-- +goose StatementEnd
