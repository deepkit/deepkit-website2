FROM node:20.8.0-alpine3.18
ENV TZ="Europe/Berlin"

EXPOSE 8080
ENV PORT 8080

#RUN su - postgres -c "/usr/lib/postgresql/14/bin/initdb -D /var/lib/postgresql/data"
#RUN mkdir -p /run/postgresql/ && chown postgres:postgres /run/postgresql/
#RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
#RUN echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

#RUN git clone --branch v0.4.0 https://github.com/pgvector/pgvector.git
#RUN cd pgvector && make && make install

RUN mkdir /app/
WORKDIR /app

#RUN pip -m venv /app/venv
#RUN /app/venv/bin/pip install -r requirements.txt

# first package manager stuff so installing is cached by Docker.
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm ci


ADD . /app

RUN npm run build

RUN npm ci --production
ADD docker_start.sh /start.sh

CMD sh /start.sh
