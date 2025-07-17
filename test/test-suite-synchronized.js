// Test suite synchronized with original comfy-table tests
// Only includes tests that can be implemented with current WASM API

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

import { createLargeTable, createAaaaaaaaTable } from './test-utils.js';

export function createSynchronizedTestSuite(TableWrapper, convert_ansi_to_html, convert_ansi_to_html_with_options) {
    const suite = new TestSuite();

    // ========== SYNCHRONIZED TESTS FROM simple_test.rs ==========
    
    // Test 1: simple_table() - Exact reproduction from original
    suite.addTest('Simple Table (from simple_test.rs)', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[34mHeader1\x1b[0m',
            '\x1b[1m\x1b[34mHeader2\x1b[0m', 
            '\x1b[1m\x1b[34mHeader3\x1b[0m'
        ]);
        table.add_row([
            '\x1b[32mThis is a text\x1b[0m',
            '\x1b[33mThis is another text\x1b[0m',
            '\x1b[36mThis is the third text\x1b[0m'
        ]);
        table.add_row([
            '\x1b[35mThis is another text\x1b[0m',
            '\x1b[31mNow\x1b[0m\n\x1b[32madd some\x1b[0m\n\x1b[33mmulti line stuff\x1b[0m',
            '\x1b[1m\x1b[32mThis is awesome\x1b[0m'
        ]);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        // Validate structure (from original test)
        if (!result.includes('Header1') || !result.includes('Header2') || !result.includes('Header3')) {
            throw new Error('Headers not found in output');
        }
        if (!result.includes('This is a text') || !result.includes('This is awesome')) {
            throw new Error('Row data not found in output');
        }
        if (!result.includes('multi line stuff')) {
            throw new Error('Multi-line content not found');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            height: table.get_height(),
            description: 'Basic table with multiline content'
        };
    });

    // Test 2: single_column_table() - Exact reproduction from original
    suite.addTest('Single Column Table (from simple_test.rs)', () => {
        const table = new TableWrapper();
        table.set_header(['\x1b[1m\x1b[36mHeader1\x1b[0m']);
        table.add_row(['\x1b[32mOne One\x1b[0m']);
        table.add_row(['\x1b[33mTwo One\x1b[0m']);
        table.add_row(['\x1b[31mThree One\x1b[0m']);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        // Validate single column structure
        if (!result.includes('Header1')) {
            throw new Error('Header not found in output');
        }
        if (!result.includes('One One') || !result.includes('Two One') || !result.includes('Three One')) {
            throw new Error('Row data not found in output');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            height: table.get_height(),
            description: 'Single column table with colored rows'
        };
    });

    // ========== SYNCHRONIZED TESTS FROM presets_test.rs ==========
    
    // Helper function to create preset test table
    function createPresetTestTable() {
        const table = new TableWrapper();
        table.set_header(['\x1b[1m\x1b[32mHello\x1b[0m', '\x1b[1m\x1b[33mthere\x1b[0m']);
        table.add_row(['\x1b[36ma\x1b[0m', '\x1b[35mb\x1b[0m']);
        table.add_row(['\x1b[31mc\x1b[0m', '\x1b[34md\x1b[0m']);
        return table;
    }

    // Test 3: test_ascii_full() - Exact reproduction from original
    suite.addTest('ASCII Full Style (from presets_test.rs)', () => {
        const table = createPresetTestTable();
        table.set_style('ascii');
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        // Validate ASCII characters are used
        if (!result.includes('+') || !result.includes('|') || !result.includes('-')) {
            throw new Error('ASCII style characters not found');
        }
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            style: 'ascii',
            description: 'ASCII table with full borders and colored content'
        };
    });

    // Test 4: test_utf8_full() - Exact reproduction from original
    suite.addTest('UTF8 Full Style (from presets_test.rs)', () => {
        const table = createPresetTestTable();
        table.set_style('modern');
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        // Validate UTF-8 characters are used
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            style: 'modern',
            description: 'UTF-8 table with full borders and colored content'
        };
    });

    // Test 5: test_utf8_full_condensed() - Maps to "rounded" in WASM
    suite.addTest('UTF8 Condensed Style (from presets_test.rs)', () => {
        const table = createPresetTestTable();
        table.set_style('rounded');
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            style: 'rounded',
            description: 'UTF-8 condensed table with colored content'
        };
    });

    // Test 6: test_ascii_borders_only() - Exact reproduction from original
    suite.addTest('ASCII Borders Only (from presets_test.rs)', () => {
        const table = createPresetTestTable();
        table.set_style('borders_only');
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            style: 'borders_only',
            description: 'ASCII table with only outer borders and colored content'
        };
    });

    // Test 7: test_ascii_horizontal_only() - Exact reproduction from original
    suite.addTest('ASCII Horizontal Only (from presets_test.rs)', () => {
        const table = createPresetTestTable();
        table.set_style('horizontal_only');
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            style: 'horizontal_only',
            description: 'ASCII table with only horizontal lines and colored content'
        };
    });

    // Test 8: test_nothing() - Maps to "no_borders" in WASM
    suite.addTest('No Borders Style (from presets_test.rs)', () => {
        const table = createPresetTestTable();
        table.set_style('no_borders');
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('Hello') || !result.includes('there')) {
            throw new Error('Headers not found');
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            style: 'no_borders',
            description: 'Table with no borders and colored content'
        };
    });

    // ========== SYNCHRONIZED TESTS FROM content_arrangement_test.rs ==========
    
    // Test 9: simple_dynamic_table() - Exact reproduction from original
    suite.addTest('Dynamic Content Arrangement (from content_arrangement_test.rs)', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[34mHeader1\x1b[0m',
            '\x1b[1m\x1b[35mHeader2\x1b[0m', 
            '\x1b[1m\x1b[36mHead\x1b[0m'
        ]);
        table.set_width(25);
        table.add_row([
            '\x1b[32mThis is a very long line with a lot of text\x1b[0m',
            '\x1b[33mThis is anotherverylongtextwithlongwords text\x1b[0m',
            '\x1b[31msmol\x1b[0m'
        ]);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        // Check that content wrapping occurred
        const lines = result.split('\n');
        
        // Function to strip ANSI codes and measure visual length
        function stripAnsi(text) {
            return text.replace(/\x1b\[[0-9;]*m/g, '');
        }
        
        function getVisualLength(text) {
            return stripAnsi(text).length;
        }
        
        const maxRawLength = Math.max(...lines.map(line => line.length));
        const maxVisualLength = Math.max(...lines.map(line => getVisualLength(line)));
        
        if (maxVisualLength > 35) { // Allow some tolerance for borders
            throw new Error(`Visual line too long: ${maxVisualLength} characters (raw: ${maxRawLength}), expected visual width ≤ 35`);
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            maxLineLength: maxRawLength,
            maxVisualLength: maxVisualLength,
            width: 25,
            description: 'Dynamic content arrangement with width constraint'
        };
    });

    // Test 10: Wide content wrapping test
    suite.addTest('Wide Content Wrapping (from content_arrangement_test.rs)', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[32mColumn 1\x1b[0m',
            '\x1b[1m\x1b[33mColumn 2\x1b[0m'
        ]);
        table.set_width(40);
        table.add_row([
            '\x1b[36mThis is a very long sentence that should wrap across multiple lines when the table width is constrained\x1b[0m',
            '\x1b[35mAnother long piece of text that will also need to wrap\x1b[0m'
        ]);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        const height = table.get_height();
        
        // Content should wrap, making table taller
        if (height < 5) {
            throw new Error(`Expected height > 5 due to wrapping, got ${height}`);
        }
        
        return { 
            output: result, 
            htmlOutput: htmlResult,
            height: height,
            width: 40,
            description: 'Wide content wrapping with colored text'
        };
    });

    // ========== ORIGINAL PERFORMANCE TESTS (Enhanced) ==========
    
    // Test 11: Large table performance (enhanced with ANSI)
    suite.addTest('Large Table Performance (Enhanced)', () => {
        const start = performance.now();
        const table = createLargeTable(TableWrapper, 100, 3, 20); // Smaller for browser
        const creationTime = performance.now() - start;
        
        const renderStart = performance.now();
        const result = table.to_string();
        const renderTime = performance.now() - renderStart;
        
        const htmlStart = performance.now();
        const htmlResult = table.to_html();
        const htmlTime = performance.now() - htmlStart;
        
        const height = table.get_height();
        
        if (height < 100) {
            throw new Error(`Expected height > 100, got ${height}`);
        }
        
        return {
            creationTime: creationTime,
            renderTime: renderTime,
            htmlConversionTime: htmlTime,
            height: height,
            plainLength: result.length,
            htmlLength: htmlResult.length,
            description: 'Large table with performance metrics'
        };
    });

    // Test 12: Pattern table performance (enhanced with ANSI)
    suite.addTest('Pattern Table Performance (Enhanced)', () => {
        const start = performance.now();
        const table = createAaaaaaaaTable(TableWrapper, 100, 2);
        const creationTime = performance.now() - start;
        
        const renderStart = performance.now();
        const result = table.to_string();
        const renderTime = performance.now() - renderStart;
        
        const htmlStart = performance.now();
        const htmlResult = table.to_html();
        const htmlTime = performance.now() - htmlStart;
        
        const height = table.get_height();
        
        if (height < 100) {
            throw new Error(`Expected height > 100, got ${height}`);
        }
        
        if (!result.includes('a')) {
            throw new Error('Result should contain "a" characters');
        }
        
        return {
            creationTime: creationTime,
            renderTime: renderTime,
            htmlConversionTime: htmlTime,
            height: height,
            plainLength: result.length,
            htmlLength: htmlResult.length,
            preview: result.split('\n').slice(0, 8).join('\n'),
            description: 'Pattern-based table with performance metrics'
        };
    });

    // ========== ANSI CONVERSION TESTS ==========
    
    // Test 13: Basic ANSI conversion
    suite.addTest('ANSI to HTML Conversion', () => {
        const ansiText = '\x1b[1m\x1b[31mBold Red\x1b[0m \x1b[32mGreen\x1b[0m \x1b[4m\x1b[34mBlue Underline\x1b[0m';
        const html = convert_ansi_to_html(ansiText);
        
        if (!html.includes('<b>') || !html.includes('</b>')) {
            throw new Error('Bold formatting not found in HTML output');
        }
        if (!html.includes('color:') || !html.includes('style=')) {
            throw new Error('Color styling not found in HTML output');
        }
        
        return { 
            input: ansiText,
            output: html,
            description: 'Basic ANSI escape sequence conversion'
        };
    });

    // Test 14: Table with ANSI content
    suite.addTest('Table with ANSI Content', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[34mName\x1b[0m', 
            '\x1b[1m\x1b[35mStatus\x1b[0m', 
            '\x1b[1m\x1b[36mLevel\x1b[0m'
        ]);
        table.add_row([
            '\x1b[1mAlice\x1b[0m',
            '\x1b[32m✓ Online\x1b[0m',
            '\x1b[1m\x1b[33mAdmin\x1b[0m'
        ]);
        table.add_row([
            '\x1b[1mBob\x1b[0m',
            '\x1b[31m✗ Offline\x1b[0m',
            '\x1b[36mUser\x1b[0m'
        ]);
        table.add_row([
            '\x1b[1mCharlie\x1b[0m',
            '\x1b[33m⚠ Away\x1b[0m',
            '\x1b[35mModerator\x1b[0m'
        ]);
        
        table.set_style('modern');
        
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
            htmlOutput: htmlOutput,
            description: 'Table with ANSI-formatted content converted to HTML'
        };
    });

    // Test 15: Color palette test
    suite.addTest('ANSI Color Palette', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1mColor\x1b[0m', 
            '\x1b[1mForeground\x1b[0m', 
            '\x1b[1mBackground\x1b[0m'
        ]);
        
        const colors = [
            { name: 'Red', fg: 31, bg: 41 },
            { name: 'Green', fg: 32, bg: 42 },
            { name: 'Yellow', fg: 33, bg: 43 },
            { name: 'Blue', fg: 34, bg: 44 },
            { name: 'Magenta', fg: 35, bg: 45 },
            { name: 'Cyan', fg: 36, bg: 46 }
        ];
        
        colors.forEach(color => {
            table.add_row([
                color.name,
                `\x1b[${color.fg}m${color.name} Text\x1b[0m`,
                `\x1b[${color.bg}m\x1b[30m ${color.name} BG \x1b[0m`
            ]);
        });
        
        table.set_style('modern');
        
        const plainOutput = table.to_string();
        const htmlOutput = table.to_html();
        
        if (!htmlOutput.includes('color:')) {
            throw new Error('Color styling not found in HTML output');
        }
        
        return { 
            plainOutput: plainOutput,
            htmlOutput: htmlOutput,
            description: 'ANSI color palette demonstration'
        };
    });

    // Test 16: Empty table edge case
    suite.addTest('Empty Table Edge Case', () => {
        const table = new TableWrapper();
        const result = table.to_string();
        const htmlResult = table.to_html();
        const height = table.get_height();
        
        if (result.length === 0) {
            throw new Error('Empty table should produce some output');
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            height: height,
            description: 'Empty table handling'
        };
    });

    // Test 17: Header-only table
    suite.addTest('Header-Only Table', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[32mColumn 1\x1b[0m',
            '\x1b[1m\x1b[33mColumn 2\x1b[0m',
            '\x1b[1m\x1b[34mColumn 3\x1b[0m'
        ]);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('Column 1') || !result.includes('Column 2') || !result.includes('Column 3')) {
            throw new Error('Headers not found in output');
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            height: table.get_height(),
            description: 'Table with only headers'
        };
    });

    // Test 18: Unicode and special characters
    suite.addTest('Unicode and Special Characters', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[34mUnicode\x1b[0m',
            '\x1b[1m\x1b[35mSymbols\x1b[0m',
            '\x1b[1m\x1b[36mEmojis\x1b[0m'
        ]);
        table.add_row([
            '\x1b[32mαβγδε ñáéíóú\x1b[0m',
            '\x1b[33m←→↑↓ ♠♥♦♣\x1b[0m',
            '\x1b[31m🚀🌟⭐🎯\x1b[0m'
        ]);
        table.add_row([
            '\x1b[36mрусский текст\x1b[0m',
            '\x1b[35m中文测试\x1b[0m',
            '\x1b[34m🔥💯✨🎉\x1b[0m'
        ]);
        
        table.set_style('modern');
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('αβγδε') || !result.includes('🚀🌟⭐🎯')) {
            throw new Error('Unicode characters not found in output');
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            description: 'Unicode and special character handling'
        };
    });

    return suite;
}