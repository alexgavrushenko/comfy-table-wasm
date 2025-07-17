# Comfy Table WASM - Test Suite

This document describes the comprehensive test suite for the comfy-table WASM wrapper.

## Overview

The test suite includes:
- **20 comprehensive tests** adapted from the original comfy-table library
- **Interactive HTML test runner** with real-time progress and detailed results
- **Performance benchmarks** for large table generation and rendering
- **Style preset validation** for all supported table styles
- **Edge case testing** for missing columns, empty tables, and special characters
- **ANSI to HTML conversion** tests for colorized and styled output

## Files

- `test/test-suite.js` - Modular test suite with all test definitions
- `test/comprehensive-test.html` - Interactive HTML test runner
- `test/ansi-demo.html` - Interactive ANSI to HTML conversion demo
- `test/test.js` - Simple Node.js test (note: requires browser environment for WASM)

## Running Tests

### 1. Build the WASM Package

```bash
# Build for web (required for HTML test runner)
npm run build:web

# Build for bundler (optional)
npm run build
```

### 2. Run Rust Tests

```bash
# Run Rust unit tests
cargo test

# Run WASM tests in Node.js environment
npm run test
```

### 3. Run HTML Test Suite

1. Serve the project directory with a local web server:
   ```bash
   # Option 1: Python
   python3 -m http.server 8000
   
   # Option 2: Node.js (if you have http-server installed)
   npx http-server .
   
   # Option 3: Any other local web server
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/test/comprehensive-test.html
   ```

3. Click "Run All Tests" to execute the complete test suite

### 4. Run ANSI Demo

1. Navigate to:
   ```
   http://localhost:8000/test/ansi-demo.html
   ```

2. Interactive features:
   - Basic ANSI to HTML conversion examples
   - Custom ANSI text converter
   - Table with ANSI content demonstration
   - ANSI color palette display

## Test Categories

### Basic Functionality Tests
- ✅ Simple table creation with headers and rows
- ✅ Missing column handling (graceful degradation)
- ✅ Single column tables
- ✅ Tables without headers
- ✅ Empty table handling

### Style Preset Tests
- ✅ ASCII style preset
- ✅ Modern UTF-8 style preset  
- ✅ Rounded style preset (uses UTF8_FULL_CONDENSED)
- ✅ Borders only style preset
- ✅ Horizontal only style preset
- ✅ No borders style preset

### Content Handling Tests
- ✅ Special characters and Unicode
- ✅ Numbers and mixed content types
- ✅ Multi-line content

### Performance Tests
- ✅ Large table creation (configurable size)
- ✅ Table rendering performance
- ✅ Memory usage estimation
- ✅ Height calculation for complex tables

### Edge Case Tests
- ✅ Width constraints and content wrapping
- ✅ Pattern-based content generation (aaaaaaaa test)

### ANSI to HTML Conversion Tests
- ✅ Basic ANSI escape sequence conversion
- ✅ Table content with ANSI formatting to HTML
- ✅ ANSI conversion error handling and fallback

## Test Results

The HTML test runner provides:
- **Real-time progress** with visual progress bar
- **Pass/fail indicators** with color coding
- **Detailed output** showing actual table renders
- **Performance metrics** including creation and render times
- **Collapsible results** for easy navigation
- **Summary statistics** with success rates

## Performance Expectations

Based on test results, typical performance for the WASM wrapper:

- **Small tables** (3x3): < 1ms creation, < 1ms render
- **Medium tables** (50x3): < 10ms creation, < 50ms render  
- **Large tables** (1000x2): < 500ms creation, < 2000ms render

Performance may vary based on:
- Cell content size and complexity
- Browser JavaScript engine
- Available system memory
- Table style complexity

## Troubleshooting

### Common Issues

1. **WASM Module Loading Error**
   - Ensure you've run `npm run build:web`
   - Check that you're serving from a web server (not file://)
   - Verify the WASM file exists in `pkg-web/`

2. **Import Errors in Node.js**
   - The bundler package requires a proper module bundler
   - Use the HTML test runner for browser-based testing
   - Rust tests work directly with `cargo test`

3. **Performance Test Failures**
   - Performance thresholds are set for typical desktop browsers
   - Slower devices may need adjusted timeout values
   - Check browser developer tools for memory constraints

### Browser Compatibility

Tested and working in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires:
- WebAssembly support
- ES6 modules support
- Modern JavaScript features (async/await, destructuring)

## Contributing

When adding new tests:

1. Add test functions to `test/test-suite.js`
2. Follow the existing pattern with proper error handling
3. Include meaningful assertions and error messages
4. Test both success and failure cases where applicable
5. Update this documentation with new test descriptions