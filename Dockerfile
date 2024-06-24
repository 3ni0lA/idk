FROM node:alpine

WORKDIR /usr/src/app

RUN npm install pm2 -g

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5100

# Command to run your app using PM2
CMD ["pm2-runtime", "start", "npm", "--", "start"]
#CMD ["npm","start", "pm2"]