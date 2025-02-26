#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}===>${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_step "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        print_message "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if [ "$(printf '%s\n' "14.0.0" "$NODE_VERSION" | sort -V | head -n1)" = "14.0.0" ]; then
        print_message "Node.js version $NODE_VERSION detected"
    else
        print_warning "Node.js version $NODE_VERSION detected. Recommended version is 14.0.0 or higher"
    fi
}

# Check if npm is installed
check_npm() {
    print_step "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_message "npm $(npm -v) detected"
}

# Update package.json dependencies to latest versions
update_dependencies() {
    print_step "Updating dependencies to latest versions..."
    
    # Server dependencies
    cat > package.json << EOF
{
  "name": "nordvik-panel",
  "version": "1.0.0",
  "description": "Nordvik Panel - A comprehensive game server management solution",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "server": "nodemon server/index.js",
    "client": "cd client && npm start",
    "install-all": "./install.sh",
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\""
  },
  "keywords": [
    "arma",
    "reforger",
    "server",
    "manager",
    "gameserver",
    "nordvik",
    "panel"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "cors": "latest",
    "express": "latest",
    "express-fileupload": "latest",
    "fs-extra": "latest",
    "socket.io": "latest",
    "winston": "latest"
  },
  "devDependencies": {
    "concurrently": "latest",
    "nodemon": "latest"
  }
}
EOF

    # Client dependencies
    cat > client/package.json << EOF
{
  "name": "nordvik-panel-client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "latest",
    "@emotion/styled": "latest",
    "@monaco-editor/react": "latest",
    "@mui/icons-material": "latest",
    "@mui/material": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "axios": "latest",
    "notistack": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "react-scripts": "5.0.1",
    "socket.io-client": "latest",
    "web-vitals": "latest",
    "xterm": "latest",
    "xterm-addon-fit": "latest"
  },
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@craco/craco": "latest",
    "autoprefixer": "latest",
    "cross-env": "latest",
    "monaco-editor-webpack-plugin": "latest",
    "postcss": "latest",
    "tailwindcss": "latest"
  },
  "proxy": "http://localhost:5000"
}
EOF
}

# Install server dependencies
install_server() {
    print_step "Installing server dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install server dependencies"
        exit 1
    fi
    print_message "Server dependencies installed successfully"
}

# Install client dependencies
install_client() {
    print_step "Installing client dependencies..."
    cd client
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install client dependencies"
        exit 1
    fi
    print_message "Client dependencies installed successfully"
    cd ..
}

# Create required directories
create_directories() {
    print_step "Creating required directories..."
    mkdir -p data/servers
    mkdir -p data/steamcmd
    mkdir -p logs
    mkdir -p client/src/components
    mkdir -p client/src/contexts
    mkdir -p client/src/pages
    mkdir -p client/src/utils
    mkdir -p client/public
    
    print_message "Directory structure created successfully"
}

# Setup environment variables
setup_env() {
    print_step "Setting up environment variables..."
    if [ ! -f .env ]; then
        echo "PORT=5000" > .env
        echo "NODE_ENV=development" >> .env
        print_message ".env file created successfully"
    else
        print_warning ".env file already exists, skipping..."
    fi
}

# Main installation process
main() {
    print_message "Starting Nordvik Panel installation process..."
    
    # Check requirements
    check_node
    check_npm
    
    # Update package.json files
    update_dependencies
    
    # Create directories
    create_directories
    
    # Setup environment
    setup_env
    
    # Install dependencies
    install_server
    install_client
    
    print_message "\nInstallation completed successfully! 🎉"
    echo -e "\n${GREEN}To start the development server:${NC}"
    echo -e "${BLUE}1.${NC} Start the backend: ${GREEN}npm run server${NC}"
    echo -e "${BLUE}2.${NC} In another terminal, start the frontend: ${GREEN}npm run client${NC}"
    echo -e "\n${YELLOW}Or run both simultaneously with:${NC} ${GREEN}npm run dev${NC}"
}

# Run the installation
main 