#!/bin/sh
su - postgres -c "/usr/lib/postgresql/14/bin/pg_ctl start -D /var/lib/postgresql/data" &

sleep 2

node dist/src/server/app.js migrate
node dist/src/server/app.js search:index
node dist/src/server/app.js import:examples
node dist/src/server/app.js import:questions

app_environment=prod app_framework_port=$PORT node dist/src/server/app.js server:start
