#!/bin/bash

# Script to generate self-signed SSL certificates for local development
# This allows testing Google Pay, Apple Pay, and other features that require HTTPS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

echo "Generating SSL certificates for localhost..."

# Generate private key and certificate in one command
openssl req -x509 \
  -newkey rsa:2048 \
  -nodes \
  -sha256 \
  -days 365 \
  -keyout "$SSL_DIR/localhost-key.pem" \
  -out "$SSL_DIR/localhost.pem" \
  -subj "/C=US/ST=State/L=City/O=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

if [ $? -eq 0 ]; then
  echo "✅ SSL certificates generated successfully!"
  echo ""
  echo "📁 Certificate files:"
  echo "   - Private key: $SSL_DIR/localhost-key.pem"
  echo "   - Certificate: $SSL_DIR/localhost.pem"
  echo ""
  echo "⚠️  IMPORTANT: Trust the certificate in your system"
  echo ""
  echo "macOS:"
  echo "  sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain \"$SSL_DIR/localhost.pem\""
  echo ""
  echo "Or double-click the certificate file and add it to Keychain Access, then set it to 'Always Trust'"
  echo ""
  echo "Chrome/Edge on macOS:"
  echo "  You may need to enable chrome://flags/#allow-insecure-localhost"
  echo ""
  echo "🚀 You can now start the HTTPS proxy server:"
  echo "   pnpm run proxy:web"
else
  echo "❌ Failed to generate SSL certificates"
  exit 1
fi

