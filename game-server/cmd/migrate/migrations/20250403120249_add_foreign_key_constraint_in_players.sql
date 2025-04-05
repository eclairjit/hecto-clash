-- +goose Up
-- +goose StatementBegin
ALTER TABLE players
ADD CONSTRAINT fk_players_game_id
FOREIGN KEY (game_id)
REFERENCES games(id)
ON DELETE CASCADE;

ALTER TABLE players
ADD CONSTRAINT fk_players_player_id
FOREIGN KEY (player_id)
REFERENCES users(id)
ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE players
DROP CONSTRAINT fk_players_game_id;

ALTER TABLE players
DROP CONSTRAINT fk_players_player_id;
-- +goose StatementEnd
