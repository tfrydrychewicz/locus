/// Transforms a search query for FTS5 prefix matching.
/// Splits on whitespace and appends `*` to each token so "to" matches "Tomasz", etc.
/// Splits on double-quote to avoid FTS5 syntax errors (e.g. `to"test` → `to* test*`).
pub fn query_for_prefix_match(query: &str) -> String {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return String::new();
    }
    trimmed
        .split_whitespace()
        .flat_map(|token| token.split('"'))
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|token| format!("{}*", token))
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prefix_single_token() {
        assert_eq!(query_for_prefix_match("to"), "to*");
    }

    #[test]
    fn prefix_multi_word() {
        assert_eq!(query_for_prefix_match("alice cooper"), "alice* cooper*");
    }

    #[test]
    fn prefix_handles_extra_spaces() {
        assert_eq!(query_for_prefix_match("  to  "), "to*");
    }

    #[test]
    fn prefix_splits_on_quotes() {
        assert_eq!(query_for_prefix_match(r#"to"test"#), "to* test*");
    }
}
