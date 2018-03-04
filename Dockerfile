FROM node:alpine as build
WORKDIR /work
RUN npm i -g typescript
COPY . .
RUN npm i --silent && tsc -p .

FROM node:alpine
ENV NODE_ENV production
EXPOSE 3000
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY --from=build /work/app ./app
CMD npm start