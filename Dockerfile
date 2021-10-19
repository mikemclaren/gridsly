FROM node:lts as dependencies
WORKDIR /gridsly
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:lts as builder
WORKDIR /gridsly
COPY . .
COPY --from=dependencies /gridsly/node_modules ./node_modules
RUN yarn build

FROM node:lts as runner
WORKDIR /gridsly
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /gridsly/next.config.js ./
COPY --from=builder /gridsly/public ./public
COPY --from=builder /gridsly/.next ./.next
COPY --from=builder /gridsly/node_modules ./node_modules
COPY --from=builder /gridsly/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start"]
