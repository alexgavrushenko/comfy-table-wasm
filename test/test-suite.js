// Test suite adapted from original comfy-table tests
// Only includes tests that can be performed with the currently exposed WASM API

export class TestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async runAll() {
        this.results = [];
        for (const test of this.tests) {
            try {
                const result = await test.testFn();
                this.results.push({
                    name: test.name,
                    status: 'PASS',
                    result: result,
                    error: null
                });
            } catch (error) {
                this.results.push({
                    name: test.name,
                    status: 'FAIL',
                    result: null,
                    error: error.message
                });
            }
        }
        return this.results;
    }

    getResults() {
        return this.results;
    }

    getPassCount() {
        return this.results.filter(r => r.status === 'PASS').length;
    }

    getFailCount() {
        return this.results.filter(r => r.status === 'FAIL').length;
    }
}

export function createTestSuite(TableWrapper, create_large_table, create_aaaaaaaa_table, convert_ansi_to_html, convert_ansi_to_html_with_options) {
    const suite = new TestSuite();

    // Test 1: Simple table creation (adapted from simple_test.rs)
    suite.addTest('Simple Table Creation', () => {
        const table = new TableWrapper();
        table.set_header(['\x1b[1m\x1b[34mHeader1\x1b[0m', '\x1b[1m\x1b[34mHeader2\x1b[0m', '\x1b[1m\x1b[34mHeader3\x1b[0m']);
        table.add_row(['\x1b[32mThis is a text\x1b[0m', '\x1b[33mThis is another text\x1b[0m', '\x1b[36mThis is the third text\x1b[0m']);
        table.add_row(['\x1b[35mThis is another text\x1b[0m', '\x1b[31mNow\x1b[0m\n\x1b[32madd some\x1b[0m\n\x1b[33mmulti line stuff\x1b[0m', '\x1b[1m\x1b[32mThis is awesome\x1b[0m']);
        
        const result = table.to_string();
        const height = table.get_height();
        
        // Basic validation
        if (!result.includes('Header1') || !result.includes('Header2') || !result.includes('Header3')) {
            throw new Error('Headers not found in output');
        }
        if (!result.includes('This is a text') || !result.includes('This is awesome')) {
            throw new Error('Row data not found in output');
        }
        if (height < 5) {
            throw new Error(`Expected height > 5, got ${height}`);
        }
        
        return { output: result, height: height };
    });

    // Test 2: Missing column table (adapted from simple_test.rs)
    suite.addTest('Missing Column Table', () => {
        const table = new TableWrapper();
        table.set_header(['Header1', 'Header2', 'Header3']);
        table.add_row(['One One', 'One Two', 'One Three']);
        table.add_row(['Two One', 'Two Two']); // Missing third column
        table.add_row(['Three One']); // Missing second and third columns
        
        const result = table.to_string();
        const height = table.get_height();
        
        // Validate that the table handles missing columns gracefully
        if (!result.includes('One One') || !result.includes('Two One') || !result.includes('Three One')) {
            throw new Error('Row data not found in output');
        }
        if (height < 5) {
            throw new Error(`Expected height > 5, got ${height}`);
        }
        
        return { output: result, height: height };
    });

    // Test 3: Single column table (adapted from simple_test.rs)
    suite.addTest('Single Column Table', () => {
        const table = new TableWrapper();
        table.set_header(['Header1']);
        table.add_row(['One One']);
        table.add_row(['Two One']);
        table.add_row(['Three One']);
        
        const result = table.to_string();
        const height = table.get_height();
        
        if (!result.includes('Header1')) {
            throw new Error('Header not found in output');
        }
        if (!result.includes('One One') || !result.includes('Two One') || !result.includes('Three One')) {
            throw new Error('Row data not found in output');
        }
        if (height < 5) {
            throw new Error(`Expected height > 5, got ${height}`);
        }
        
        return { output: result, height: height };
    });

    // Test 4: Table without header
    suite.addTest('Table Without Header', () => {
        const table = new TableWrapper();
        table.add_row(['Row 1 Col 1', 'Row 1 Col 2']);
        table.add_row(['Row 2 Col 1', 'Row 2 Col 2']);
        table.add_row(['Row 3 Col 1', 'Row 3 Col 2']);
        
        const result = table.to_string();
        const height = table.get_height();
        
        if (!result.includes('Row 1 Col 1') || !result.includes('Row 3 Col 2')) {
            throw new Error('Row data not found in output');
        }
        if (height < 3) {
            throw new Error(`Expected height > 3, got ${height}`);
        }
        
        return { output: result, height: height };
    });

    // Test 5: Style presets (adapted from presets_test.rs)
    suite.addTest('ASCII Style Preset', () => {
        const table = new TableWrapper();
        table.set_header(['Hello', 'there']);
        table.add_row(['a', 'b']);
        table.add_row(['c', 'd']);
        table.set_style('ascii');
        
        const result = table.to_string();
        
        // Should contain ASCII characters for borders
        if (!result.includes('+') || !result.includes('|') || !result.includes('-')) {
            throw new Error('ASCII style characters not found');
        }
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { output: result, style: 'ascii' };
    });

    // Test 6: Modern UTF-8 style
    suite.addTest('Modern UTF-8 Style Preset', () => {
        const table = new TableWrapper();
        table.set_header(['Hello', 'there']);
        table.add_row(['a', 'b']);
        table.add_row(['c', 'd']);
        table.set_style('modern');
        
        const result = table.to_string();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { output: result, style: 'modern' };
    });

    // Test 7: Rounded style
    suite.addTest('Rounded Style Preset', () => {
        const table = new TableWrapper();
        table.set_header(['Hello', 'there']);
        table.add_row(['a', 'b']);
        table.add_row(['c', 'd']);
        table.set_style('rounded');
        
        const result = table.to_string();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { output: result, style: 'rounded' };
    });

    // Test 8: Borders only style
    suite.addTest('Borders Only Style Preset', () => {
        const table = new TableWrapper();
        table.set_header(['Hello', 'there']);
        table.add_row(['a', 'b']);
        table.add_row(['c', 'd']);
        table.set_style('borders_only');
        
        const result = table.to_string();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { output: result, style: 'borders_only' };
    });

    // Test 9: Horizontal only style
    suite.addTest('Horizontal Only Style Preset', () => {
        const table = new TableWrapper();
        table.set_header(['Hello', 'there']);
        table.add_row(['a', 'b']);
        table.add_row(['c', 'd']);
        table.set_style('horizontal_only');
        
        const result = table.to_string();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { output: result, style: 'horizontal_only' };
    });

    // Test 10: No borders style
    suite.addTest('No Borders Style Preset', () => {
        const table = new TableWrapper();
        table.set_header(['Hello', 'there']);
        table.add_row(['a', 'b']);
        table.add_row(['c', 'd']);
        table.set_style('no_borders');
        
        const result = table.to_string();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { output: result, style: 'no_borders' };
    });

    // Test 11: Table with width constraint
    suite.addTest('Table With Width Constraint', () => {
        const table = new TableWrapper();
        table.set_header(['Very Long Header 1', 'Very Long Header 2', 'Very Long Header 3']);
        table.add_row(['Very long content that should be wrapped', 'Another very long content', 'Third very long content']);
        table.set_width(50);
        
        const result = table.to_string();
        const lines = result.split('\n');
        
        // Check that no line exceeds the width (with some tolerance for borders)
        const maxLineLength = Math.max(...lines.map(line => line.length));
        if (maxLineLength > 60) { // Allow some tolerance
            throw new Error(`Line too long: ${maxLineLength} characters`);
        }
        
        return { output: result, maxLineLength: maxLineLength };
    });

    // Test 12: Large table performance test
    suite.addTest('Large Table Performance', () => {
        const start = performance.now();
        const table = create_large_table(50, 3, 10); // Smaller for browser testing
        const creationTime = performance.now() - start;
        
        const renderStart = performance.now();
        const result = table.to_string();
        const renderTime = performance.now() - renderStart;
        
        const height = table.get_height();
        
        if (height < 50) {
            throw new Error(`Expected height > 50, got ${height}`);
        }
        
        return {
            creationTime: creationTime,
            renderTime: renderTime,
            height: height,
            length: result.length
        };
    });

    // Test 13: Aaaaaaaa table test
    suite.addTest('Aaaaaaaa Table Test', () => {
        const start = performance.now();
        const table = create_aaaaaaaa_table(50, 2); // Smaller for browser testing
        const creationTime = performance.now() - start;
        
        const renderStart = performance.now();
        const result = table.to_string();
        const renderTime = performance.now() - renderStart;
        
        const height = table.get_height();
        
        if (height < 50) {
            throw new Error(`Expected height > 50, got ${height}`);
        }
        
        // Check that it contains 'a' characters
        if (!result.includes('a')) {
            throw new Error('Result should contain "a" characters');
        }
        
        return {
            creationTime: creationTime,
            renderTime: renderTime,
            height: height,
            length: result.length,
            preview: result.split('\n').slice(0, 10).join('\n')
        };
    });

    // Test 14: Empty table
    suite.addTest('Empty Table', () => {
        const table = new TableWrapper();
        const result = table.to_string();
        const height = table.get_height();
        
        // Empty table should still produce some output
        if (result.length === 0) {
            throw new Error('Empty table should produce some output');
        }
        
        return { output: result, height: height };
    });

    // Test 15: Table with only header
    suite.addTest('Table With Only Header', () => {
        const table = new TableWrapper();
        table.set_header(['Col1', 'Col2', 'Col3']);
        
        const result = table.to_string();
        const height = table.get_height();
        
        if (!result.includes('Col1') || !result.includes('Col2') || !result.includes('Col3')) {
            throw new Error('Headers not found in output');
        }
        
        return { output: result, height: height };
    });

    // Test 16: Special characters in content
    suite.addTest('Special Characters In Content', () => {
        const table = new TableWrapper();
        table.set_header(['Unicode', 'Symbols', 'Special']);
        table.add_row(['αβγδε', '←→↑↓', '♠♥♦♣']);
        table.add_row(['🚀🌟⭐', '123€$¥', 'café']);
        
        const result = table.to_string();
        
        if (!result.includes('αβγδε') || !result.includes('🚀🌟⭐') || !result.includes('café')) {
            throw new Error('Special characters not found in output');
        }
        
        return { output: result };
    });

    // Test 17: Numbers and mixed content
    suite.addTest('Numbers And Mixed Content', () => {
        const table = new TableWrapper();
        table.set_header(['Integer', 'Float', 'Text']);
        table.add_row(['42', '3.14159', 'Mixed 123']);
        table.add_row(['-999', '0.0', 'Text with numbers 456']);
        table.add_row(['0', '1.23e-4', 'Special chars: @#$%']);
        
        const result = table.to_string();
        
        if (!result.includes('42') || !result.includes('3.14159') || !result.includes('@#$%')) {
            throw new Error('Mixed content not found in output');
        }
        
        return { output: result };
    });

    // Test 18: ANSI to HTML conversion
    suite.addTest('ANSI to HTML Conversion', () => {
        if (!convert_ansi_to_html || !convert_ansi_to_html_with_options) {
            throw new Error('ANSI conversion functions not available');
        }
        
        // Test basic ANSI sequences
        const ansiText = '\x1b[1mBold\x1b[0m \x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m \x1b[4mUnderline\x1b[0m';
        const html = convert_ansi_to_html(ansiText);
        
        if (!html.includes('<b>') || !html.includes('</b>')) {
            throw new Error('Bold formatting not found in HTML output');
        }
        if (!html.includes('style=') || !html.includes('color:')) {
            throw new Error('Color styling not found in HTML output');
        }
        
        // Test with options
        const htmlWithOptions = convert_ansi_to_html_with_options(ansiText, true);
        
        return { 
            input: ansiText,
            output: html,
            outputWithOptions: htmlWithOptions
        };
    });

    // Test 19: Table with ANSI content to HTML
    suite.addTest('Table With ANSI Content to HTML', () => {
        const table = new TableWrapper();
        table.set_header(['Name', 'Status']);
        table.add_row(['\x1b[1mAlice\x1b[0m', '\x1b[32mOnline\x1b[0m']);
        table.add_row(['\x1b[1mBob\x1b[0m', '\x1b[31mOffline\x1b[0m']);
        
        const plainOutput = table.to_string();
        const htmlOutput = table.to_html();
        
        if (!htmlOutput.includes('<b>')) {
            throw new Error('Bold formatting not found in HTML table output');
        }
        if (!htmlOutput.includes('color:')) {
            throw new Error('Color styling not found in HTML table output');
        }
        
        return { 
            plainOutput: plainOutput,
            htmlOutput: htmlOutput
        };
    });

    // Test 20: ANSI conversion fallback
    suite.addTest('ANSI Conversion Fallback', () => {
        if (!convert_ansi_to_html) {
            throw new Error('ANSI conversion function not available');
        }
        
        // Test with potentially invalid ANSI sequences
        const invalidAnsi = '\x1b[999mInvalid\x1b[0m Normal text';
        const html = convert_ansi_to_html(invalidAnsi);
        
        if (html.includes('\x1b[')) {
            throw new Error('ANSI escape sequences should be stripped in fallback');
        }
        if (!html.includes('Normal text')) {
            throw new Error('Normal text should be preserved in fallback');
        }
        
        return { 
            input: invalidAnsi,
            output: html
        };
    });

    return suite;
}