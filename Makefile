db:
	@docker exec -it todo_db bash

migrate-up:
	@npm run migrate:up

migrate-down:
	@npm run migrate:down

migrate-create:
	@npm run migrate:create $(name)