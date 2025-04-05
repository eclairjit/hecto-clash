-- +goose Up
ALTER TABLE players
ADD CONSTRAINT pk_players
PRIMARY KEY (game_id, player_id);
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
ALTER TABLE players
DROP CONSTRAINT pk_players;
-- +goose StatementBegin
-- +goose StatementEnd
