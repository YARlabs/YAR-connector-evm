FROM node:18-alpine
WORKDIR ./bridge/packages/validator/app
COPY ./ ./
RUN npm install
EXPOSE 3000
CMD npm run start