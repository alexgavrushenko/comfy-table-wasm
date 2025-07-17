# comfy-table-wasm

A WebAssembly wrapper for the Rust `comfy-table` library, optimized for use in React and other JavaScript applications.

## Installation

```bash
npm install comfy-table-wasm
```

## Usage in React

With the bundler target, WASM is automatically bundled - no manual initialization needed!

```javascript
import { useEffect, useState } from 'react';
import { TableWrapper, create_large_table, create_aaaaaaaa_table } from 'comfy-table-wasm';

function MyComponent() {
  const [tableOutput, setTableOutput] = useState('');

  useEffect(() => {
    const createTable = () => {
      try {
        // Direct usage - no init() needed with bundler target!
        const table = new TableWrapper();
        table.set_header(['Name', 'Age', 'City']);
        table.add_row(['Alice', '30', 'New York']);
        table.add_row(['Bob', '25', 'San Francisco']);
        
        // Apply styling (new feature!)
        table.set_style('rounded');
        
        // Convert to string and set state
        setTableOutput(table.to_string());
      } catch (error) {
        console.error('Table creation failed:', error);
      }
    };

    createTable();
  }, []);

  return (
    <div>
      <pre>{tableOutput}</pre>
    </div>
  );
}
```

### Bundler vs Web Target

- **Bundler Target** (Current): WASM is bundled with your app, no manual init needed
- **Web Target**: Requires manual `await init()` and fetches WASM at runtime

If you need the web target, you can switch with:
```bash
npm run build:web
# or: wasm-pack build --target web --out-dir pkg-web
```

## API

### TableWrapper

- `new TableWrapper()` - Create a new table
- `set_header(headers: string[])` - Set table headers
- `add_row(cells: string[])` - Add a row to the table
- `set_width(width: number)` - Set table width
- `set_style(style: string)` - Set table style ("ascii", "modern", "rounded", "borders_only", "horizontal_only", "no_borders")
- `to_string(): string` - Convert table to string representation
- `get_height(): number` - Get the number of lines in the rendered table

### Utility Functions

- `create_large_table(rows: number, cols: number, cell_size: number)` - Create a large table with repeated content
- `create_aaaaaaaa_table(rows: number, cols: number)` - Create a table with varying 'a' patterns

## Features

This package includes the following comfy-table features:
- **custom_styling**: Advanced styling and customization options

Note: The `tty` feature is not available in WASM environments due to system dependencies.

## Build Target

This package is built with `--target bundler` and is optimized for use with:
- Webpack
- Vite
- Parcel
- Rollup
- Other modern bundlers

## Development

```bash
# Build the WASM package (bundler target)
npm run build

# Build for web target
npm run build:web

# Run Rust tests
cargo test

# View browser test
open test/test.html
```

## Performance

The library provides excellent performance for table generation and rendering:
- Supports thousands of rows with sub-second generation times
- Optimized for both creation and rendering operations
- Memory efficient with predictable resource usage

## Test Suite

This package includes a comprehensive test suite with interactive browser testing:

### 🧪 Interactive Test Suite

The test suite is automatically deployed to GitHub Pages and includes:

- **Synchronized Tests**: Exact reproductions of original comfy-table tests
- **Extended Tests**: Performance benchmarks, stress tests, and edge cases  
- **ANSI to HTML Conversion**: Beautiful color formatting in the browser
- **Debug Tools**: Interactive debugging for failed tests
- **Unicode Support**: International characters and emoji testing

**🌐 [View Live Test Suite](https://your-username.github.io/comfy-table-wasm/)**

### Local Testing

```bash
# Run local test server
npm run serve
# or: python3 -m http.server 8000

# Open browser tests
open http://localhost:8000/test/comprehensive-test.html
```

### Test Categories

- **Table Creation**: Basic table functionality and structure
- **Style Presets**: All available table styling options
- **Dynamic Content**: Width constraints and content wrapping
- **Performance**: Large table generation and rendering speed
- **ANSI Colors**: Color formatting and HTML conversion
- **Unicode**: International text and special characters
- **Edge Cases**: Empty tables, malformed input, stress testing

## Browser Compatibility

Compatible with all modern browsers that support WebAssembly (ES2015+).