# Select a base image
FROM node:20

# Create a directory  and go to the directory 
WORKDIR /app

# Copy the package.json file to my current directory to install the necessary dependence  
COPY . .

# Install the dependence
RUN npm install --production

# Expose port
EXPOSE 5000

CMD ["npm", "start"]