FROM nodesource/node:6

RUN mkdir -p /home/nodejs/app && mkdir -p /datadir
WORKDIR /home/nodejs/app

COPY . /home/nodejs/app
RUN rm -rf node_modules && npm install --production .

EXPOSE 8080
CMD ["node", "index.js"]
