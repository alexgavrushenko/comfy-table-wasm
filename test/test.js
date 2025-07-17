import pkg from '../pkg/comfy_table_wasm.js';
const { TableWrapper, create_large_table, create_aaaaaaaa_table } = pkg;

async function runTests() {
    
    console.log('Starting JavaScript WASM tests...\n');
    
    // Test 1: Basic table creation
    console.log('=== Test 1: Basic Table Creation ===');
    const start1 = performance.now();
    const table = new TableWrapper();
    table.set_header(['Name', 'Value']);
    table.add_row(['Test', 'Data']);
    const basicTable = table.to_string();
    const end1 = performance.now();
    
    console.log('Basic table created in:', (end1 - start1).toFixed(2), 'ms');
    console.log('Basic table height:', table.get_height(), 'lines');
    console.log('Basic table preview:', basicTable.substring(0, 100) + '...\n');
    
    // Test 2: Large table performance test
    console.log('=== Test 2: Large Table Performance (1000 rows x 2 cols) ===');
    const rows = 1000;
    const cols = 2;
    const cellSize = 75; // 50-100 range
    
    const start2 = performance.now();
    const largeTable = create_large_table(rows, cols, cellSize);
    const end2 = performance.now();
    
    console.log('Large table created in:', (end2 - start2).toFixed(2), 'ms');
    
    const start3 = performance.now();
    const largeTableString = largeTable.to_string();
    const end3 = performance.now();
    
    console.log('Large table rendered in:', (end3 - start3).toFixed(2), 'ms');
    console.log('Large table height:', largeTable.get_height(), 'lines');
    console.log('Large table string length:', largeTableString.length, 'characters');
    
    // Memory usage estimation
    const memoryUsage = (largeTableString.length * 2) / 1024 / 1024; // Approximate MB
    console.log('Estimated memory usage:', memoryUsage.toFixed(2), 'MB');
    
    // Performance assertions
    const totalTime = (end2 - start2) + (end3 - start3);
    console.log('Total time:', totalTime.toFixed(2), 'ms');
    
    if (totalTime > 5000) {
        console.warn('⚠️  Performance warning: Operation took longer than 5 seconds');
    } else {
        console.log('✅ Performance test passed');
    }
    
    if (largeTable.get_height() > 0 && largeTableString.length > 0) {
        console.log('✅ Table generation test passed');
    } else {
        console.error('❌ Table generation test failed');
    }
    
    // Show a small preview of the table
    console.log('\n=== Table Preview ===');
    const lines = largeTableString.split('\n');
    console.log(lines.slice(0, 10).join('\n'));
    console.log('...');
    console.log(lines.slice(-5).join('\n'));
    
    // Test 3: Aaaaaaaa table height test
    console.log('\n=== Test 3: Aaaaaaaa Table Height Test (1000 rows x 1 col) ===');
    const aaRows = 1000;
    const aaCols = 1;
    
    const start4 = performance.now();
    const aaTable = create_aaaaaaaa_table(aaRows, aaCols);
    const end4 = performance.now();
    
    console.log('Aaaaaaaa table created in:', (end4 - start4).toFixed(2), 'ms');
    
    const start5 = performance.now();
    const aaTableString = aaTable.to_string();
    const end5 = performance.now();
    
    console.log('Aaaaaaaa table rendered in:', (end5 - start5).toFixed(2), 'ms');
    const aaHeight = aaTable.get_height();
    console.log('Aaaaaaaa table height:', aaHeight, 'lines');
    console.log('Aaaaaaaa table string length:', aaTableString.length, 'characters');
    
    // Height assertion
    if (aaHeight > 2000) {
        console.log('✅ Height test passed: ' + aaHeight + ' > 2000');
    } else {
        console.error('❌ Height test failed: ' + aaHeight + ' <= 2000');
    }
    
    // Performance assertion
    const aaTotal = (end4 - start4) + (end5 - start5);
    console.log('Total time:', aaTotal.toFixed(2), 'ms');
    
    if (aaTotal > 50) {
        console.warn('⚠️  Performance warning: Operation took longer than 50ms');
    } else {
        console.log('✅ Performance test passed');
    }
    
    // Show a small preview of the aaaaaaaa table
    console.log('\n=== Aaaaaaaa Table Preview ===');
    const aaLines = aaTableString.split('\n');
    console.log(aaLines.slice(0, 15).join('\n'));
    console.log('...');
    console.log(aaLines.slice(-10).join('\n'));
}

runTests().catch(console.error);