FROM node:20-slim

# Install network tools needed by the poller
RUN apt-get update && apt-get install -y \
    iputils-ping \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Expose Vite dev server port
EXPOSE 5173

# Run the dev server by default
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
