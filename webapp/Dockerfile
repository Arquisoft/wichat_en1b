FROM node:22

COPY . /app
WORKDIR /app

ARG API_URI
ENV REACT_APP_API_ENDPOINT=$API_URI

#Install the dependencies
RUN npm install --omit=dev

#Create an optimized version of the webapp
RUN npm run build
RUN npm install -g serve --production

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]
#CMD ["npm", "start"]
