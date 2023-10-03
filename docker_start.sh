#!/bin/sh
su - postgres -c "/usr/lib/postgresql/14/bin/pg_ctl start -D /var/lib/postgresql/data" &

sleep 2

node dist/src/server/app.js migrate
node dist/src/server/app.js search:index

APP_ENVIRONMENT=prod APP_FRAMEWORK_PORT=$PORT node dist/src/server/app.js server:start
