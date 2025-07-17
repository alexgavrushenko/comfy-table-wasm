#!/bin/bash
# Simple script to serve the test files

echo "Starting web server..."
echo "Open http://localhost:8080/test/comprehensive-test.html in your browser"
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8080