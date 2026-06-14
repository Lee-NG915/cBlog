FROM openresty/openresty:1.15.8.3-2-xenial

# only for jenkins
# RUN curl -o /run/apollo-template.tar.gz -fSL "https://github.com/castlery/apollo-template/releases/download/0.0.3/apollo-template_0.0.3_linux_amd64.tar.gz" \
#     && tar -zxvf /run/apollo-template.tar.gz --directory /usr/local/bin/ \
#     && rm /run/apollo-template.tar.gz

COPY ./nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY ./lua /usr/local/openresty/lualib/
COPY docker-entrypoint.sh /sbin/docker-entrypoint.sh
COPY ./conf.d /usr/local/openresty/nginx/conf/conf.d
# default.conf init by github action
COPY ./conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY . /opt/nginx


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


RUN mkdir -p /usr/local/openresty/nginx/html/.well-known/
# RUN bash /opt/nginx/scripts/docker-build-assets.sh

EXPOSE 80/tcp
CMD ["/usr/local/openresty/nginx/sbin/nginx", "-c", "/usr/local/openresty/nginx/conf/nginx.conf", "-g", "daemon off;"]
