#!/bin/bash

# CourseKit MCP - Installation and Setup Script
# This script helps you get started with CourseKit quickly

set -e  # Exit on error

echo "======================================"
echo "   CourseKit MCP Setup Script"
echo "======================================"
echo ""

# Function to print colored output
print_success() { echo -e "\033[0;32m✓ $1\033[0m"; }
print_info() { echo -e "\033[0;36mℹ $1\033[0m"; }
print_error() { echo -e "\033[0;31m✗ $1\033[0m"; }

# Check for Node.js
print_info "Checking dependencies..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. You have $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check for npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi
print_success "npm $(npm -v) found"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Create output directory
print_info "Creating output directory..."
mkdir -p .coursekit
print_success "Output directory created"

# Check for command argument
if [ "$1" == "install" ]; then
    print_success "Installation complete!"
    echo ""
    echo "Next steps:"
    echo "1. Run './setup.sh dev' to start in development mode"
    echo "2. Run './setup.sh start' to start in production mode"
    echo "3. Configure your MCP client to connect to this server"
    echo ""
    echo "Example Claude Desktop configuration:"
    echo "{"
    echo '  "mcp_servers": {'
    echo '    "coursekit": {'
    echo '      "command": "node",'
    echo "      \"args\": [\"$(pwd)/index.js\"]"
    echo "    }"
    echo "  }"
    echo "}"
    
elif [ "$1" == "dev" ]; then
    print_info "Starting CourseKit MCP in development mode..."
    echo "Server will restart on file changes"
    echo "Press Ctrl+C to stop"
    echo ""
    npm run dev
    
elif [ "$1" == "start" ]; then
    print_info "Starting CourseKit MCP server..."
    echo "Press Ctrl+C to stop"
    echo ""
    npm start
    
elif [ "$1" == "clean" ]; then
    print_info "Cleaning generated files..."
    rm -rf .coursekit
    mkdir -p .coursekit
    print_success "Clean complete"
    
elif [ "$1" == "example" ]; then
    print_info "Running example workflow..."
    node example-workflow.js
    print_success "Example workflow complete"
    echo "Check .coursekit/ directory for generated files"
    
else
    echo "CourseKit MCP - Setup and Management Script"
    echo ""
    echo "Usage: ./setup.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install  - Install dependencies and setup"
    echo "  start    - Start the MCP server"
    echo "  dev      - Start in development mode (auto-reload)"
    echo "  clean    - Remove all generated files"
    echo "  example  - Run example workflow"
    echo ""
    echo "Example:"
    echo "  ./setup.sh install  # First time setup"
    echo "  ./setup.sh start    # Run the server"
fi
