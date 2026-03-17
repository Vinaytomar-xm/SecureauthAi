FROM node:18-alpine

WORKDIR /app/backend

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
