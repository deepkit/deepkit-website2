FROM ubuntu:22.04
ENV DEBIAN_FRONTEND="noninteractive"
ENV TZ="Europe/Berlin"

RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs python3-pip postgresql postgresql-server-dev-14 libpq-dev g++ gcc git

WORKDIR /app

# first package manager stuff so installing is cached by Docker.
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm ci

ADD . /app

RUN npm run build

EXPOSE 8080

RUN su - postgres -c "/usr/lib/postgresql/14/bin/initdb -D /var/lib/postgresql/data"
RUN mkdir -p /run/postgresql/ && chown postgres:postgres /run/postgresql/
RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
RUN echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

RUN git clone --branch v0.4.0 https://github.com/pgvector/pgvector.git
RUN cd pgvector && make && make install

ADD docker_start.sh /start.sh

# remove cache from APT
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PORT 8080
CMD sh /start.sh
