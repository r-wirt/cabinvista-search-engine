#https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

#Docker file for Node.js application image

FROM node:8.9.1

RUN mkdir /fun.server
RUN mkdir fun.server/Fun.1.2

COPY server.js /fun.server
COPY Fun.1.2 fun.server/Fun.1.2
#A wildcard is used to ensure both package.json AND package-lock.json are copied
#where available (npm@5+)
COPY package.json /fun.server

WORKDIR /fun.server
RUN npm install
RUN npm install pm2 -g
EXPOSE 8080
ENTRYPOINT ["pm2-docker", "server.js"]


#If you are building your code for production
#RUN npm install --only=production

#-t is the 'tag' argument, specifies a name for th eimage
#Building the image:
#docker build -t Fun.server .<—dot is the location of the docker file(in this case, the current directory)

#Running image as container:
#docker run —rm -p 3000:3000 -d Fun.server
