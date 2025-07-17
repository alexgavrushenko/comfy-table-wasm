// Test utility functions for generating test tables
// These functions are implemented in JavaScript instead of being exported from WASM

export function createLargeTable(TableWrapper, rows, cols, cellSize) {
    const table = new TableWrapper();

    // Create header
    const header = [];
    for (let i = 0; i < cols; i++) {
        header.push(`Column ${i + 1}`);
    }
    table.set_header(header);

    // Create cell content
    const cellContent = '?\n'.repeat(cellSize);

    // Add rows
    for (let row = 0; row < rows; row++) {
        const rowData = [];
        for (let col = 0; col < cols; col++) {
            rowData.push(cellContent);
        }
        table.add_row(rowData);
    }

    return table;
}

export function createAaaaaaaaTable(TableWrapper, rows, cols) {
    const table = new TableWrapper();

    // Create header
    const header = [];
    for (let i = 0; i < cols; i++) {
        header.push(`#${i + 1}`);
    }
    table.set_header(header);
    table.set_width(7);

    // Add rows with varying 'a' patterns
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
        const rowData = [];
        for (let colIdx = 0; colIdx < cols; colIdx++) {
            // Use simple hash-based pattern generation (5-10 'a's)
            const seed = (rowIdx * 17 + colIdx * 31) % 6;
            const patternCount = 5 + seed;
            rowData.push('a'.repeat(patternCount));
        }
        table.add_row(rowData);
    }

    return table;
}

// Helper function for generating test data with specific patterns
export function createTestTable(TableWrapper, config = {}) {
    const {
        rows = 10,
        cols = 3,
        headerPrefix = 'Col',
        cellPattern = 'data',
        useAnsi = false,
        style = 'modern',
        width = null
    } = config;

    const table = new TableWrapper();

    // Create header with optional ANSI formatting
    const header = [];
    for (let i = 0; i < cols; i++) {
        let headerText = `${headerPrefix} ${i + 1}`;
        if (useAnsi) {
            // Add some color variation to headers
            const colors = ['\x1b[34m', '\x1b[35m', '\x1b[36m']; // Blue, Magenta, Cyan
            const color = colors[i % colors.length];
            headerText = `\x1b[1m${color}${headerText}\x1b[0m`;
        }
        header.push(headerText);
    }
    table.set_header(header);

    // Set style and width if specified
    table.set_style(style);
    if (width) {
        table.set_width(width);
    }

    // Add rows
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
        const rowData = [];
        for (let colIdx = 0; colIdx < cols; colIdx++) {
            let cellText = `${cellPattern} ${rowIdx + 1}.${colIdx + 1}`;
            
            if (useAnsi) {
                // Add some color variation to cells
                const colors = ['\x1b[32m', '\x1b[33m', '\x1b[31m']; // Green, Yellow, Red
                const color = colors[(rowIdx + colIdx) % colors.length];
                cellText = `${color}${cellText}\x1b[0m`;
            }
            
            rowData.push(cellText);
        }
        table.add_row(rowData);
    }

    return table;
}

// Utility for creating performance test data
export function generatePerformanceTestData(size) {
    const data = [];
    const cellPatterns = [
        'Short',
        'Medium length content',
        'Very long content that might need wrapping in narrow columns',
        'Mixed\ncontent\nwith\nmultiple\nlines'
    ];

    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < 3; j++) {
            const pattern = cellPatterns[i % cellPatterns.length];
            row.push(`${pattern} (${i + 1}.${j + 1})`);
        }
        data.push(row);
    }

    return data;
}