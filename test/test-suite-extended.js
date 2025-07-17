// Extended test suite - Only unique/extended cases not covered in synchronized tests
// Focus: Performance, edge cases, stress tests, and unique scenarios

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

export function createTestSuite(TableWrapper, convert_ansi_to_html, convert_ansi_to_html_with_options) {
    const suite = new TestSuite();

    // ========== PERFORMANCE TESTS ==========

    // Test 1: Large Table Performance Benchmark
    suite.addTest('Performance - Large Table (1000x3)', () => {
        const start = performance.now();
        const table = createLargeTable(TableWrapper, 1000, 3, 50);
        const creationTime = performance.now() - start;
        
        const renderStart = performance.now();
        const result = table.to_string();
        const renderTime = performance.now() - renderStart;
        
        const htmlStart = performance.now();
        const htmlResult = table.to_html();
        const htmlTime = performance.now() - htmlStart;
        
        const height = table.get_height();
        
        if (height < 1000) {
            throw new Error(`Expected height > 1000, got ${height}`);
        }
        
        if (creationTime > 5000) {
            throw new Error(`Creation too slow: ${creationTime.toFixed(2)}ms (should be < 5s)`);
        }
        
        if (renderTime > 10000) {
            throw new Error(`Rendering too slow: ${renderTime.toFixed(2)}ms (should be < 10s)`);
        }
        
        return {
            creationTime: creationTime,
            renderTime: renderTime,
            htmlConversionTime: htmlTime,
            height: height,
            plainLength: result.length,
            htmlLength: htmlResult.length,
            preview: result.split('\n').slice(0, 10).join('\n'),
            description: 'Large table performance benchmark (1000 rows, 3 columns, 50-char cells)'
        };
    });

    // Test 2: Pattern Table Performance Benchmark  
    suite.addTest('Performance - Pattern Table (1000x2)', () => {
        const start = performance.now();
        const table = createAaaaaaaaTable(TableWrapper, 1000, 2);
        const creationTime = performance.now() - start;
        
        const renderStart = performance.now();
        const result = table.to_string();
        const renderTime = performance.now() - renderStart;
        
        const htmlStart = performance.now();
        const htmlResult = table.to_html();
        const htmlTime = performance.now() - htmlStart;
        
        const height = table.get_height();
        
        if (height < 2000) {
            throw new Error(`Expected height > 2000, got ${height}`);
        }
        
        if (!result.includes('a')) {
            throw new Error('Result should contain "a" characters');
        }
        
        if (creationTime > 5000) {
            throw new Error(`Creation too slow: ${creationTime.toFixed(2)}ms (should be < 5s)`);
        }
        
        if (renderTime > 10000) {
            throw new Error(`Rendering too slow: ${renderTime.toFixed(2)}ms (should be < 10s)`);
        }
        
        return {
            creationTime: creationTime,
            renderTime: renderTime,
            htmlConversionTime: htmlTime,
            height: height,
            plainLength: result.length,
            htmlLength: htmlResult.length,
            preview: result.split('\n').slice(0, 10).join('\n'),
            description: 'Pattern table performance benchmark (1000 rows, 2 columns, variable "a" patterns)'
        };
    });

    // Test 3: Memory Stress Test - Multiple Large Tables
    suite.addTest('Stress Test - Multiple Large Tables', () => {
        const tables = [];
        const results = [];
        const totalStart = performance.now();
        
        // Create 5 large tables
        for (let i = 0; i < 5; i++) {
            const start = performance.now();
            const table = createLargeTable(TableWrapper, 200, 4, 25);
            const creationTime = performance.now() - start;
            
            const renderStart = performance.now();
            const result = table.to_string();
            const renderTime = performance.now() - renderStart;
            
            tables.push(table);
            results.push(result);
        }
        
        const totalTime = performance.now() - totalStart;
        const totalMemory = results.reduce((sum, result) => sum + result.length, 0);
        
        if (totalTime > 15000) {
            throw new Error(`Total time too slow: ${totalTime.toFixed(2)}ms (should be < 15s)`);
        }
        
        return {
            tableCount: tables.length,
            totalTime: totalTime,
            totalMemory: totalMemory,
            avgTime: totalTime / tables.length,
            description: 'Stress test creating 5 large tables (200x4 each)'
        };
    });

    // ========== EDGE CASE TESTS ==========

    // Test 4: Empty Table Handling
    suite.addTest('Edge Case - Empty Table', () => {
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
            description: 'Empty table with no headers or rows'
        };
    });

    // Test 5: Header-Only Table
    suite.addTest('Edge Case - Header Only', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[32mColumn A\x1b[0m',
            '\x1b[1m\x1b[33mColumn B\x1b[0m',
            '\x1b[1m\x1b[34mColumn C\x1b[0m'
        ]);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('Column A') || !result.includes('Column B') || !result.includes('Column C')) {
            throw new Error('Headers not found in output');
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            height: table.get_height(),
            description: 'Table with headers but no data rows'
        };
    });

    // Test 6: Extreme Width Constraints
    suite.addTest('Edge Case - Extreme Width Constraint', () => {
        const table = new TableWrapper();
        table.set_header(['A', 'B']);
        table.add_row([
            '\x1b[31mVery long content that should definitely wrap\x1b[0m',
            '\x1b[32mAnother very long piece of content\x1b[0m'
        ]);
        table.set_width(15); // Very narrow
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        const lines = result.split('\n');
        
        // Function to get visual length without ANSI codes
        function getVisualLength(text) {
            return text.replace(/\x1b\[[0-9;]*m/g, '').length;
        }
        
        const maxVisualLength = Math.max(...lines.map(line => getVisualLength(line)));
        
        if (maxVisualLength > 25) { // Allow some tolerance
            throw new Error(`Lines too wide: ${maxVisualLength} chars, expected ≤ 25`);
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            width: 15,
            maxVisualLength: maxVisualLength,
            description: 'Extreme width constraint forcing aggressive wrapping'
        };
    });

    // Test 7: Very Long Single Cell
    suite.addTest('Edge Case - Extremely Long Single Cell', () => {
        const table = new TableWrapper();
        table.set_header(['Long Content']);
        
        const longText = '\x1b[36m' + 'a'.repeat(1000) + '\x1b[0m';
        table.add_row([longText]);
        table.set_width(30);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        const height = table.get_height();
        
        if (height < 10) {
            throw new Error(`Expected height > 10 due to wrapping, got ${height}`);
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            height: height,
            cellLength: 1000,
            description: 'Single cell with 1000 characters'
        };
    });

    // ========== ANSI CONVERSION EDGE CASES ==========

    // Test 8: Complex ANSI Sequences
    suite.addTest('ANSI - Complex Nested Sequences', () => {
        const complexAnsi = '\x1b[1m\x1b[31m\x1b[4mBold Red Underlined\x1b[0m \x1b[42m\x1b[30mGreen BG Black Text\x1b[0m \x1b[38;5;196mBright Red\x1b[0m';
        const html = convert_ansi_to_html(complexAnsi);
        
        // Check for actual formatting elements used by ansi-to-html crate
        if (!html.includes('<b>') || !html.includes('<u>') || !html.includes('background')) {
            throw new Error('Complex ANSI formatting not properly converted');
        }
        
        return { 
            input: complexAnsi,
            output: html,
            description: 'Complex nested ANSI sequences with multiple formats'
        };
    });

    // Test 9: ANSI in Table with All Styles
    suite.addTest('ANSI - Table with All Style Presets', () => {
        const styles = ['ascii', 'modern', 'rounded', 'borders_only', 'horizontal_only', 'no_borders'];
        const results = {};
        
        for (const style of styles) {
            const table = new TableWrapper();
            table.set_style(style);
            table.set_header([
                `\x1b[1m\x1b[34mStyle: ${style}\x1b[0m`,
                '\x1b[1m\x1b[35mFormatted\x1b[0m'
            ]);
            table.add_row([
                '\x1b[32m✓ Green\x1b[0m',
                '\x1b[31m✗ Red\x1b[0m'
            ]);
            
            const plainOutput = table.to_string();
            const htmlOutput = table.to_html();
            
            results[style] = {
                plain: plainOutput,
                html: htmlOutput
            };
        }
        
        return { 
            results: results,
            styleCount: styles.length,
            description: 'Testing ANSI conversion across all table styles'
        };
    });

    // Test 10: ANSI Malformed Sequences
    suite.addTest('ANSI - Malformed Sequence Handling', () => {
        const malformedAnsi = '\x1b[999mInvalid\x1b[0m \x1b[mIncomplete \x1b[31;99;999mOverload\x1b[0m Normal';
        const html = convert_ansi_to_html(malformedAnsi);
        
        if (html.includes('\x1b[')) {
            throw new Error('Malformed ANSI sequences should be stripped');
        }
        
        if (!html.includes('Normal')) {
            throw new Error('Normal text should be preserved');
        }
        
        return { 
            input: malformedAnsi,
            output: html,
            description: 'Handling of malformed ANSI escape sequences'
        };
    });

    // ========== UNICODE AND SPECIAL CHARACTER TESTS ==========

    // Test 11: Unicode Stress Test
    suite.addTest('Unicode - International Characters', () => {
        const table = new TableWrapper();
        table.set_header([
            '\x1b[1m\x1b[34mLanguage\x1b[0m',
            '\x1b[1m\x1b[35mText\x1b[0m',
            '\x1b[1m\x1b[36mEmoji\x1b[0m'
        ]);
        
        const testCases = [
            ['English', 'Hello World', '🇺🇸🌍'],
            ['Russian', 'Привет мир', '🇷🇺❄️'],
            ['Chinese', '你好世界', '🇨🇳🐉'],
            ['Arabic', 'مرحبا بالعالم', '🇸🇦🕌'],
            ['Japanese', 'こんにちは世界', '🇯🇵🗾'],
            ['Hindi', 'नमस्ते दुनिया', '🇮🇳🕉️'],
            ['Thai', 'สวัสดีโลก', '🇹🇭🏛️']
        ];
        
        testCases.forEach(([lang, text, emoji]) => {
            table.add_row([
                `\x1b[32m${lang}\x1b[0m`,
                `\x1b[33m${text}\x1b[0m`,
                `\x1b[31m${emoji}\x1b[0m`
            ]);
        });
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('你好世界') || !result.includes('🇺🇸🌍')) {
            throw new Error('Unicode characters not found in output');
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            languageCount: testCases.length,
            description: 'International text and emoji rendering'
        };
    });

    // Test 12: Special ASCII and Control Characters
    suite.addTest('Special Characters - ASCII Extended', () => {
        const table = new TableWrapper();
        table.set_header(['Type', 'Characters']);
        table.add_row(['Math', '∑∏∆√∞±≠≤≥']);
        table.add_row(['Currency', '€£¥₹₽₩₪₨']);
        table.add_row(['Arrows', '←→↑↓↔↕⇄⇅']);
        table.add_row(['Symbols', '♠♥♦♣♪♫♯♭']);
        table.add_row(['Greek', 'αβγδεζηθικλμ']);
        
        const result = table.to_string();
        const htmlResult = table.to_html();
        
        if (!result.includes('∑∏∆') || !result.includes('←→↑↓')) {
            throw new Error('Special characters not found in output');
        }
        
        return { 
            output: result,
            htmlOutput: htmlResult,
            description: 'Special ASCII extended characters and symbols'
        };
    });

    return suite;
}