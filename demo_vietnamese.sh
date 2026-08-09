#!/bin/bash

# Vietnamese Disease Symptom Classifier Demo Script
# This script sets up and runs the demo with PhoBert model

echo "🇻🇳 Vietnamese Disease Symptom Classifier Demo"
echo "=============================================="
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   - Installing npm packages..."
npm install

echo "   - Installing backend dependencies..."
cd backend && npm install && cd ..

echo "   - Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "   - Installing Python dependencies..."
cd python-service && pip3 install -r requirements.txt && cd ..

echo "✅ Dependencies installed"
echo ""

# Setup PhoBert model
echo "🤖 Setting up PhoBert model..."
cd python-service
python3 test_mode.py
cd ..

echo "✅ PhoBert model setup complete"
echo ""

# Create environment files
echo "⚙️  Setting up environment files..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "   - Backend .env created"
fi
cd ..

cd frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "   - Frontend .env created"
fi
cd ..

echo "✅ Environment files ready"
echo ""

echo "🚀 Demo Setup Complete!"
echo ""
echo "To run the demo, open 3 terminals and execute:"
echo ""
echo "Terminal 1 (Python Service):"
echo "  cd python-service && python3 app.py"
echo ""
echo "Terminal 2 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 3 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "📝 Example Vietnamese symptoms to try:"
echo "  - 'Tôi bị sốt cao, ho khan và đau họng'"
echo "  - 'Đau đầu dữ dội, buồn nôn và mệt mỏi'"
echo "  - 'Hắt hơi, chảy mũi và ngứa mắt'"
echo "  - 'Đau bụng, tiêu chảy và mất nước'"
echo ""
echo "🎯 Model Classes (Vietnamese):"
echo "  - Cảm lạnh, Cúm, COVID-19, Dị ứng"
echo "  - Đau nửa đầu, Ngộ độc thức ăn, Viêm dạ dày"
echo "  - Viêm phế quản, Viêm phổi, Viêm xoang"
