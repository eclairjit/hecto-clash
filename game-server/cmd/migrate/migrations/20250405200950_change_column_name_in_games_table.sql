-- +goose Up
ALTER TABLE games
RENAME COLUMN roomId TO room_id;
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
ALTER TABLE games
RENAME COLUMN room_id TO roomId;
-- +goose StatementBegin
-- +goose StatementEnd
