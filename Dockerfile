FROM ubuntu:22.04
ENV DEBIAN_FRONTEND="noninteractive"
ENV TZ="Europe/Berlin"
ENV NODE_MAJOR=20

EXPOSE 8080
ENV PORT 8080

RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg nodejs python3 python3-pip postgresql postgresql-server-dev-14 libpq-dev g++ gcc git
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y nodejs

RUN su - postgres -c "/usr/lib/postgresql/14/bin/initdb -D /var/lib/postgresql/data"
RUN mkdir -p /run/postgresql/ && chown postgres:postgres /run/postgresql/
RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
RUN echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

RUN git clone --branch v0.4.0 https://github.com/pgvector/pgvector.git
RUN cd pgvector && make && make install

RUN mkdir /app/
WORKDIR /app

RUN pip -m venv /app/venv
RUN /app/venv/bin/pip install -r requirements.txt

# first package manager stuff so installing is cached by Docker.
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm ci

ADD . /app

RUN npm run build
ADD docker_start.sh /start.sh

# remove cache from APT
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

CMD sh /start.sh
