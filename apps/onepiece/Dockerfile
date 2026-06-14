FROM node:18-buster

RUN rm -rf /var/lib/apt/lists/*

# RUN apt-get update \
#     && apt-get install -y --no-install-recommends \
#         unzip \
#     && rm -rf /var/lib/apt/lists/*

# only for jenkins
# RUN curl -o /run/apollo-template.tar.gz -fSL "https://github.com/castlery/apollo-template/releases/download/0.0.3/apollo-template_0.0.3_linux_amd64.tar.gz" \
#     && tar -zxvf /run/apollo-template.tar.gz --directory /usr/local/bin/ \
#     && rm /run/apollo-template.tar.gz

RUN mkdir -p /app/
WORKDIR /app/


COPY ./package.json ./yarn.lock ./.npmrc /app/
RUN yarn install --frozen-lockfile --production

ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}

ARG APP_COMMIT
ENV APP_COMMIT ${APP_COMMIT}

ARG APP_ENV
ENV APP_ENV ${APP_ENV}

ARG APP_NAME
ENV APP_NAME ${APP_NAME}

ARG APP_BUILD
ENV APP_BUILD ${APP_BUILD}

ENV NODE_ENV=production

# static build on gh-actions
# .env,default.conf init by github action
ADD . /app/
RUN bash /app/scripts/docker-build-assets.sh

EXPOSE 9000 8000 7000
CMD [ "node" ]