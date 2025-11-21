# Select a base image
FROM node:20

# --- Install Dependencies for Docker CLI ---
# Update package list and install necessary packages:
#   curl, ca-certificates, gnupg, lsb-release (required for Docker's official install steps)
RUN apt-get update && \
    apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    lsb-release && \
    rm -rf /var/lib/apt/lists/*

# --- Add Docker's Official GPG Key ---
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg

# --- Add Docker Repository ---
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# --- Install Docker CLI --
# Only install the CLI package; the daemon is not needed inside this container.
RUN apt-get update && \
    apt-get install -y docker-ce-cli

# Create a directory  and go to the directory 
WORKDIR /app

# Copy the package.json file to my current directory to install the necessary dependence  
COPY . .

# Install the dependence
RUN npm install --production

# Expose port
EXPOSE 5000

CMD ["npm", "start"]
