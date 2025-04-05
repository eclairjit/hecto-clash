-- +goose Up
ALTER TABLE games
ALTER COLUMN hectoc_puzzle DROP NOT NULL;
-- +goose StatementBegin
-- +goose StatementEnd

-- +goose Down
ALTER TABLE games
ALTER COLUMN hectoc_puzzle SET NOT NULL;
-- +goose StatementBegin
-- +goose StatementEnd
