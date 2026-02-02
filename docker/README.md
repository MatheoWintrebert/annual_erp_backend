This folder contains Docker configuration to run a MySQL database for the annual_erp project.

Files:
- `mysql/Dockerfile` - builds a MySQL 8.1 image and copies initialization scripts.
- `mysql/initdb/init.sql` - example SQL that creates the `annual_erp_db` database, an `admin` user and an example `users` table.
- `docker-compose.mysql.yml` - compose file that builds and runs the MySQL service with a named volume.

Quick start (from project root):

```bash
# build and start the MySQL container
docker compose -f docker/docker-compose.mysql.yml up -d --build

# follow logs
docker compose -f docker/docker-compose.mysql.yml logs -f mysql

# stop and remove
docker compose -f docker/docker-compose.mysql.yml down -v
```

Notes:
- Change passwords (`MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`) before using in production.
- The init SQL runs only when the data directory is empty. To re-run, remove the named volume: `docker compose -f docker/docker-compose.mysql.yml down -v`.
