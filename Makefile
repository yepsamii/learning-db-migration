db:
	@docker exec -it todo_db bash

migrate-up:
	@DATABASE_URL=postgres://postgres:postgres@localhost:5432/todo_db npm run migrate:up

migrate-down:
	@DATABASE_URL=postgres://postgres:postgres@localhost:5432/todo_db npm run migrate:down

migrate-create:
	@npm run migrate:create $(name)