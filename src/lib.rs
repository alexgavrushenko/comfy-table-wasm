use comfy_table::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct TableWrapper {
    table: Table,
}

#[wasm_bindgen]
impl TableWrapper {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TableWrapper {
        TableWrapper {
            table: Table::new(),
        }
    }

    #[wasm_bindgen]
    pub fn add_row(&mut self, cells: Vec<String>) {
        let row = Row::from(cells);
        self.table.add_row(row);
    }

    #[wasm_bindgen]
    pub fn set_width(&mut self, width: u16) {
        self.table
            .set_width(width)
            .set_content_arrangement(ContentArrangement::Dynamic);
    }

    #[wasm_bindgen]
    pub fn set_style(&mut self, style: &str) {
        use comfy_table::presets::*;
        match style {
            "ascii" => self.table.load_preset(ASCII_FULL),
            "modern" => self.table.load_preset(UTF8_FULL),
            "rounded" => self.table.load_preset(UTF8_FULL_CONDENSED), // Use condensed as "rounded" alternative
            "borders_only" => self.table.load_preset(UTF8_BORDERS_ONLY),
            "horizontal_only" => self.table.load_preset(UTF8_HORIZONTAL_ONLY),
            "no_borders" => self.table.load_preset(NOTHING),
            _ => self.table.load_preset(UTF8_FULL),
        };
    }

    #[wasm_bindgen]
    pub fn set_header(&mut self, headers: Vec<String>) {
        self.table.set_header(headers);
    }

    #[allow(clippy::inherent_to_string)]
    #[wasm_bindgen]
    pub fn to_string(&self) -> String {
        self.table.to_string()
    }

    #[wasm_bindgen]
    pub fn get_height(&self) -> usize {
        self.table.to_string().lines().count()
    }

    #[wasm_bindgen]
    pub fn to_html(&self) -> String {
        let table_string = self.table.to_string();
        convert_ansi_to_html(&table_string)
    }
}

impl Default for TableWrapper {
    fn default() -> Self {
        Self::new()
    }
}

// Test helper functions - removed from WASM exports, now implemented in JavaScript

#[wasm_bindgen]
pub fn convert_ansi_to_html(input: &str) -> String {
    match ansi_to_html::convert(input) {
        Ok(html) => html,
        Err(_) => {
            // If conversion fails, return the input with ANSI codes stripped
            console::strip_ansi_codes(input).to_string()
        }
    }
}

#[wasm_bindgen]
pub fn convert_ansi_to_html_with_options(input: &str, _use_classes: bool) -> String {
    let converter = ansi_to_html::Converter::new();

    match converter.convert(input) {
        Ok(html) => html,
        Err(_) => {
            // If conversion fails, return the input with ANSI codes stripped
            console::strip_ansi_codes(input).to_string()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Instant;

    // Local helper functions for testing
    fn create_large_table_local(rows: usize, cols: usize, cell_size: usize) -> TableWrapper {
        let mut table = TableWrapper::new();

        // Create header
        let header: Vec<String> = (0..cols).map(|i| format!("Column {}", i + 1)).collect();
        table.set_header(header);

        // Create cell content
        let cell_content = "?\n".repeat(cell_size);

        // Add rows
        for _row in 0..rows {
            let row_data: Vec<String> = (0..cols).map(|_| cell_content.clone()).collect();
            table.add_row(row_data);
        }

        table
    }

    fn create_aaaaaaaa_table_local(rows: usize, cols: usize) -> TableWrapper {
        let mut table = TableWrapper::new();

        // Create header
        let header: Vec<String> = (0..cols).map(|i| format!("#{}", i + 1)).collect();
        table.set_header(header);
        table.set_width(7);

        // Add rows with varying a
        for row_idx in 0..rows {
            let row_data: Vec<String> = (0..cols)
                .map(|col_idx| {
                    // Use simple hash-based pattern generation (5-10 'a's)
                    let seed = (row_idx * 17 + col_idx * 31) % 6;
                    let pattern_count = 5 + seed;
                    "a".repeat(pattern_count)
                })
                .collect();
            table.add_row(row_data);
        }

        table
    }

    #[test]
    fn test_large_table_performance() {
        let rows = 1000;
        let cols = 2;
        let cell_size = 75; // 50-100 range

        let start = Instant::now();
        let table = create_large_table_local(rows, cols, cell_size);
        let creation_time = start.elapsed();

        let start = Instant::now();
        let table_string = table.to_string();
        let render_time = start.elapsed();

        let height = table.get_height();

        println!("Table creation time: {:?}", creation_time);
        println!("Table render time: {:?}", render_time);
        println!("Table height: {} lines", height);
        println!("Table string length: {} characters", table_string.len());

        assert!(height > 0);
        assert!(table_string.len() > 0);
        assert!(creation_time.as_millis() < 500); // Should complete within 500ms
    }

    #[test]
    fn test_aaaaaaaa_table_height() {
        let rows = 1000;
        let cols = 1;

        let start = Instant::now();
        let table = create_aaaaaaaa_table_local(rows, cols);
        let creation_time = start.elapsed();

        let start = Instant::now();
        let table_string = table.to_string();
        let render_time = start.elapsed();

        let height = table.get_height();

        println!("Aaaaaaaa table creation time: {:?}", creation_time);
        println!("Aaaaaaaa table render time: {:?}", render_time);
        println!("Aaaaaaaa table height: {} lines", height);
        println!(
            "Aaaaaaaa table string length: {} characters",
            table_string.len()
        );

        assert!(
            height > 2000,
            "Table height {} should be greater than 2000",
            height
        );
        assert!(table_string.len() > 0);
        assert!(creation_time.as_millis() < 500); // Should complete within 500ms
    }

    #[test]
    fn test_table_styling() {
        let mut table = TableWrapper::new();
        table.set_header(vec!["Name".to_string(), "Age".to_string()]);
        table.add_row(vec!["Alice".to_string(), "30".to_string()]);
        table.add_row(vec!["Bob".to_string(), "25".to_string()]);

        // Test different styles
        let styles = vec![
            "ascii",
            "modern",
            "rounded",
            "borders_only",
            "horizontal_only",
            "no_borders",
        ];

        for style in styles {
            table.set_style(style);
            let output = table.to_string();
            println!("Style '{}' output:\n{}", style, output);
            assert!(output.len() > 0, "Style '{}' should produce output", style);
        }
    }

    #[test]
    fn test_ansi_to_html_conversion() {
        // Test basic ANSI escape sequences
        let ansi_text = "\x1b[1mBold\x1b[0m \x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m";
        let html = convert_ansi_to_html(ansi_text);

        println!("ANSI input: {}", ansi_text);
        println!("HTML output: {}", html);

        // Check that HTML contains expected elements
        assert!(html.contains("<b>"), "Should contain bold tags");
        assert!(html.contains("</b>"), "Should contain bold close tags");
        assert!(html.contains("style="), "Should contain style attributes");
        assert!(html.contains("color:"), "Should contain color styles");

        // Test with options
        let html_with_classes = convert_ansi_to_html_with_options(ansi_text, true);
        println!("HTML with classes: {}", html_with_classes);

        // Test table with ANSI content
        let mut table = TableWrapper::new();
        table.set_header(vec!["Name".to_string(), "Status".to_string()]);
        table.add_row(vec![
            "\x1b[1mAlice\x1b[0m".to_string(),
            "\x1b[32mOnline\x1b[0m".to_string(),
        ]);
        table.add_row(vec![
            "\x1b[1mBob\x1b[0m".to_string(),
            "\x1b[31mOffline\x1b[0m".to_string(),
        ]);

        let table_html = table.to_html();
        println!("Table HTML output:\n{}", table_html);

        assert!(table_html.len() > 0, "HTML table should not be empty");
        assert!(
            table_html.contains("<b>"),
            "Table HTML should contain bold formatting"
        );
    }

    #[test]
    fn test_ansi_conversion_fallback() {
        // Test with invalid ANSI sequence to ensure fallback works
        let invalid_ansi = "\x1b[999mInvalid\x1b[0m Normal text";
        let html = convert_ansi_to_html(invalid_ansi);

        println!("Invalid ANSI input: {}", invalid_ansi);
        println!("Fallback HTML output: {}", html);

        // Should contain the text without ANSI codes
        assert!(html.contains("Normal text"), "Should contain normal text");
        assert!(
            !html.contains("\x1b["),
            "Should not contain ANSI escape sequences"
        );
    }
}
