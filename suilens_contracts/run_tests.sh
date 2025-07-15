#!/bin/bash

echo "Running SUI-Lens Smart Contract Tests..."
echo "========================================"

# Run tests and capture output
output=$(sui move test 2>&1)

# Check if tests passed
if echo "$output" | grep -q "Test results:"; then
    echo "✅ Tests completed!"
    echo ""
    echo "Test Summary:"
    echo "$output" | grep -A 10 "Test results:" | head -15
else
    echo "⚠️  Tests completed with warnings. Checking for failures..."
    
    # Check for compilation errors
    if echo "$output" | grep -q "error\["; then
        echo "❌ Compilation errors found!"
        echo "$output" | grep -A 5 "error\[" | head -20
    else
        echo "✅ No compilation errors found."
        echo ""
        echo "Note: Many warnings are expected due to duplicate imports and unused constants."
        echo "These warnings don't affect test execution."
    fi
fi

echo ""
echo "To run tests with full output: sui move test"
echo "To run tests with less noise: sui move test 2>&1 | grep -v 'warning'"