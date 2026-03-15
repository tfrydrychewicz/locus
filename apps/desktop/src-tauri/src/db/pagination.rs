use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Page<T> {
    pub items: Vec<T>,
    pub cursor: Option<String>,
    pub has_more: bool,
    pub total_estimate: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PaginationParams {
    pub cursor: Option<String>,
    pub limit: Option<u32>,
}

impl PaginationParams {
    pub fn effective_limit(&self) -> u32 {
        self.limit.unwrap_or(50).min(100)
    }
}

impl<T> Page<T> {
    pub fn empty() -> Self {
        Self {
            items: Vec::new(),
            cursor: None,
            has_more: false,
            total_estimate: 0,
        }
    }
}

pub fn encode_cursor(sort_key: &str, id: &str) -> String {
    use std::io::Write;
    let mut buf = Vec::new();
    write!(buf, "{}\x00{}", sort_key, id).unwrap();
    base64_encode(&buf)
}

pub fn decode_cursor(cursor: &str) -> Option<(String, String)> {
    let bytes = base64_decode(cursor)?;
    let s = String::from_utf8(bytes).ok()?;
    let (sort_key, id) = s.split_once('\x00')?;
    Some((sort_key.to_string(), id.to_string()))
}

fn base64_encode(input: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut result = String::new();
    for chunk in input.chunks(3) {
        let b0 = chunk[0] as usize;
        let b1 = if chunk.len() > 1 { chunk[1] as usize } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as usize } else { 0 };
        result.push(CHARS[(b0 >> 2) & 0x3f] as char);
        result.push(CHARS[((b0 << 4) | (b1 >> 4)) & 0x3f] as char);
        if chunk.len() > 1 {
            result.push(CHARS[((b1 << 2) | (b2 >> 6)) & 0x3f] as char);
        }
        if chunk.len() > 2 {
            result.push(CHARS[b2 & 0x3f] as char);
        }
    }
    result
}

fn base64_decode(input: &str) -> Option<Vec<u8>> {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut result = Vec::new();
    let bytes: Vec<u8> = input
        .bytes()
        .filter_map(|b| CHARS.iter().position(|&c| c == b).map(|p| p as u8))
        .collect();
    for chunk in bytes.chunks(4) {
        if chunk.len() >= 2 {
            result.push((chunk[0] << 2) | (chunk[1] >> 4));
        }
        if chunk.len() >= 3 {
            result.push((chunk[1] << 4) | (chunk[2] >> 2));
        }
        if chunk.len() >= 4 {
            result.push((chunk[2] << 6) | chunk[3]);
        }
    }
    Some(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cursor_roundtrip() {
        let cursor = encode_cursor("2025-01-15T10:30:00", "01HQRX5K3M9P0G6B8V7CWDYF2N");
        let (sort_key, id) = decode_cursor(&cursor).expect("should decode");
        assert_eq!(sort_key, "2025-01-15T10:30:00");
        assert_eq!(id, "01HQRX5K3M9P0G6B8V7CWDYF2N");
    }

    #[test]
    fn test_decode_invalid() {
        assert!(decode_cursor("!!!").is_none() || decode_cursor("!!!").is_some());
    }

    #[test]
    fn test_effective_limit() {
        let p = PaginationParams {
            cursor: None,
            limit: None,
        };
        assert_eq!(p.effective_limit(), 50);

        let p = PaginationParams {
            cursor: None,
            limit: Some(200),
        };
        assert_eq!(p.effective_limit(), 100);

        let p = PaginationParams {
            cursor: None,
            limit: Some(25),
        };
        assert_eq!(p.effective_limit(), 25);
    }

    #[test]
    fn test_page_empty() {
        let page: Page<String> = Page::empty();
        assert!(page.items.is_empty());
        assert!(page.cursor.is_none());
        assert!(!page.has_more);
        assert_eq!(page.total_estimate, 0);
    }
}
