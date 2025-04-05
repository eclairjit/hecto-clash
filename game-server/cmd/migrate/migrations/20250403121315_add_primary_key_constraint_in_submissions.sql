-- +goose Up
ALTER TABLE submissions
ADD CONSTRAINT pk_submissions PRIMARY KEY (game_id, player_id, submitted_at);
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
ALTER TABLE submissions
DROP CONSTRAINT pk_submissions;
-- +goose StatementBegin
-- +goose StatementEnd
