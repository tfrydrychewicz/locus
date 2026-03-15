/// Minimal LQL (Locus Query Language) tokenizer and SQL translator.
///
/// Translates a subset of LQL expressions into a SQLite WHERE clause fragment
/// and a corresponding list of bound parameters.
///
/// Supported syntax:
///   comparison  ::= field op value
///   field       ::= IDENT
///   op          ::= "=" | "!=" | "<" | ">" | "<=" | ">=" | "contains" | "not_contains" | "in"
///   value       ::= STRING | NUMBER | BOOL | "null" | "{" IDENT "}" | "[" value,... "]"
///   expr        ::= comparison
///               | "not" expr
///               | expr "and" expr
///               | expr "or" expr
///               | "(" expr ")"
///
/// Special fields:
///   entity_type  → translates to entity_type_slug
///   name         → translates to name column
///   id           → translates to id column
///   any other    → translates to json_extract(fields, '$.field')
///
/// Variables:
///   {this}       → replaced with the provided context entity ID

use rusqlite::types::ToSql;

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Ident(String),
    Str(String),
    Num(f64),
    Bool(bool),
    Null,
    Eq,
    Neq,
    Lt,
    Gt,
    Lte,
    Gte,
    LParen,
    RParen,
    LBracket,
    RBracket,
    Comma,
    And,
    Or,
    Not,
    Contains,
    NotContains,
    In,
    Variable(String),
    Eof,
}

fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let chars: Vec<char> = input.chars().collect();
    let mut pos = 0;

    while pos < chars.len() {
        match chars[pos] {
            ' ' | '\t' | '\r' | '\n' => {
                pos += 1;
            }
            '(' => {
                tokens.push(Token::LParen);
                pos += 1;
            }
            ')' => {
                tokens.push(Token::RParen);
                pos += 1;
            }
            '[' => {
                tokens.push(Token::LBracket);
                pos += 1;
            }
            ']' => {
                tokens.push(Token::RBracket);
                pos += 1;
            }
            ',' => {
                tokens.push(Token::Comma);
                pos += 1;
            }
            '=' => {
                tokens.push(Token::Eq);
                pos += 1;
            }
            '!' => {
                if pos + 1 < chars.len() && chars[pos + 1] == '=' {
                    tokens.push(Token::Neq);
                    pos += 2;
                } else {
                    return Err(format!("unexpected '!' at position {}", pos));
                }
            }
            '<' => {
                if pos + 1 < chars.len() && chars[pos + 1] == '=' {
                    tokens.push(Token::Lte);
                    pos += 2;
                } else {
                    tokens.push(Token::Lt);
                    pos += 1;
                }
            }
            '>' => {
                if pos + 1 < chars.len() && chars[pos + 1] == '=' {
                    tokens.push(Token::Gte);
                    pos += 2;
                } else {
                    tokens.push(Token::Gt);
                    pos += 1;
                }
            }
            '\'' | '"' => {
                let quote = chars[pos];
                pos += 1;
                let mut s = String::new();
                while pos < chars.len() && chars[pos] != quote {
                    if chars[pos] == '\\' && pos + 1 < chars.len() {
                        pos += 1;
                        match chars[pos] {
                            'n' => s.push('\n'),
                            't' => s.push('\t'),
                            c => s.push(c),
                        }
                    } else {
                        s.push(chars[pos]);
                    }
                    pos += 1;
                }
                if pos >= chars.len() {
                    return Err("unterminated string literal".to_string());
                }
                pos += 1; // consume closing quote
                tokens.push(Token::Str(s));
            }
            '{' => {
                pos += 1;
                let mut name = String::new();
                while pos < chars.len() && chars[pos] != '}' {
                    name.push(chars[pos]);
                    pos += 1;
                }
                if pos >= chars.len() {
                    return Err("unterminated variable reference".to_string());
                }
                pos += 1; // consume '}'
                tokens.push(Token::Variable(name.trim().to_string()));
            }
            c if c.is_ascii_digit() || (c == '-' && pos + 1 < chars.len() && chars[pos + 1].is_ascii_digit()) => {
                let start = pos;
                if chars[pos] == '-' {
                    pos += 1;
                }
                while pos < chars.len() && (chars[pos].is_ascii_digit() || chars[pos] == '.') {
                    pos += 1;
                }
                let num_str: String = chars[start..pos].iter().collect();
                match num_str.parse::<f64>() {
                    Ok(n) => tokens.push(Token::Num(n)),
                    Err(_) => return Err(format!("invalid number: {}", num_str)),
                }
            }
            c if c.is_alphabetic() || c == '_' => {
                let start = pos;
                while pos < chars.len() && (chars[pos].is_alphanumeric() || chars[pos] == '_') {
                    pos += 1;
                }
                let word: String = chars[start..pos].iter().collect();
                let tok = match word.to_ascii_lowercase().as_str() {
                    "and" => Token::And,
                    "or" => Token::Or,
                    "not" => Token::Not,
                    "contains" => Token::Contains,
                    "not_contains" => Token::NotContains,
                    "in" => Token::In,
                    "true" => Token::Bool(true),
                    "false" => Token::Bool(false),
                    "null" => Token::Null,
                    _ => Token::Ident(word),
                };
                tokens.push(tok);
            }
            c => return Err(format!("unexpected character '{}' at position {}", c, pos)),
        }
    }
    tokens.push(Token::Eof);
    Ok(tokens)
}

// ── Parser ────────────────────────────────────────────────────────────────────

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

/// SQL fragment with positional parameters.
struct SqlExpr {
    sql: String,
    params: Vec<SqlValue>,
}

#[derive(Debug, Clone)]
pub enum SqlValue {
    Str(String),
    Num(f64),
    Bool(bool),
    #[allow(dead_code)]
    Null,
}

impl ToSql for SqlValue {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        match self {
            SqlValue::Str(s) => s.to_sql(),
            SqlValue::Num(n) => n.to_sql(),
            SqlValue::Bool(b) => {
                let v = *b as i32;
                Ok(rusqlite::types::ToSqlOutput::Owned(rusqlite::types::Value::Integer(v as i64)))
            }
            SqlValue::Null => rusqlite::types::Null.to_sql(),
        }
    }
}

impl Parser {
    fn new(tokens: Vec<Token>) -> Self {
        Parser { tokens, pos: 0 }
    }

    fn peek(&self) -> &Token {
        &self.tokens[self.pos]
    }

    fn advance(&mut self) -> Token {
        let tok = self.tokens[self.pos].clone();
        if self.pos + 1 < self.tokens.len() {
            self.pos += 1;
        }
        tok
    }

    fn expect_ident(&mut self) -> Result<String, String> {
        match self.advance() {
            Token::Ident(s) => Ok(s),
            other => Err(format!("expected identifier, got {:?}", other)),
        }
    }

    fn parse_value(
        &mut self,
        this_entity_id: Option<&str>,
    ) -> Result<(String, Vec<SqlValue>), String> {
        match self.peek().clone() {
            Token::Str(s) => {
                self.advance();
                Ok(("?".to_string(), vec![SqlValue::Str(s)]))
            }
            Token::Num(n) => {
                self.advance();
                Ok(("?".to_string(), vec![SqlValue::Num(n)]))
            }
            Token::Bool(b) => {
                self.advance();
                Ok(("?".to_string(), vec![SqlValue::Bool(b)]))
            }
            Token::Null => {
                self.advance();
                Ok(("NULL".to_string(), vec![]))
            }
            Token::Variable(name) => {
                self.advance();
                let val = if name == "this" {
                    match this_entity_id {
                        Some(id) => SqlValue::Str(id.to_string()),
                        None => return Err("{this} variable requires a context entity".to_string()),
                    }
                } else {
                    return Err(format!("unknown variable {{{}}}", name));
                };
                Ok(("?".to_string(), vec![val]))
            }
            Token::LBracket => {
                self.advance(); // consume '['
                let mut placeholders = Vec::new();
                let mut params = Vec::new();
                loop {
                    if matches!(self.peek(), Token::RBracket) {
                        self.advance();
                        break;
                    }
                    let (ph, mut p) = self.parse_value(this_entity_id)?;
                    placeholders.push(ph);
                    params.append(&mut p);
                    match self.peek() {
                        Token::Comma => {
                            self.advance();
                        }
                        Token::RBracket => {}
                        other => return Err(format!("expected ',' or ']', got {:?}", other)),
                    }
                }
                Ok((format!("({})", placeholders.join(", ")), params))
            }
            other => Err(format!("expected value, got {:?}", other)),
        }
    }

    fn field_to_sql(field: &str) -> String {
        match field {
            "entity_type" => "entity_type_slug".to_string(),
            "name" | "id" | "entity_type_slug" | "entity_type_id" | "created_at"
            | "updated_at" | "trashed_at" => field.to_string(),
            other => format!("json_extract(fields, '$.{}')", other),
        }
    }

    fn parse_comparison(
        &mut self,
        this_entity_id: Option<&str>,
    ) -> Result<SqlExpr, String> {
        let field = self.expect_ident()?;
        let col = Self::field_to_sql(&field);

        let op = self.advance();
        let (value_sql, mut params) = match &op {
            Token::Eq
            | Token::Neq
            | Token::Lt
            | Token::Gt
            | Token::Lte
            | Token::Gte
            | Token::Contains
            | Token::NotContains
            | Token::In => self.parse_value(this_entity_id)?,
            other => return Err(format!("expected operator, got {:?}", other)),
        };

        let sql = match op {
            Token::Eq => {
                if value_sql == "NULL" {
                    format!("{} IS NULL", col)
                } else {
                    format!("{} = {}", col, value_sql)
                }
            }
            Token::Neq => {
                if value_sql == "NULL" {
                    format!("{} IS NOT NULL", col)
                } else {
                    format!("{} != {}", col, value_sql)
                }
            }
            Token::Lt => format!("{} < {}", col, value_sql),
            Token::Gt => format!("{} > {}", col, value_sql),
            Token::Lte => format!("{} <= {}", col, value_sql),
            Token::Gte => format!("{} >= {}", col, value_sql),
            Token::Contains => {
                // Wrap the string param with % wildcards
                if let Some(SqlValue::Str(s)) = params.first() {
                    let pattern = format!("%{}%", s);
                    params[0] = SqlValue::Str(pattern);
                }
                format!("{} LIKE ?", col)
            }
            Token::NotContains => {
                if let Some(SqlValue::Str(s)) = params.first() {
                    let pattern = format!("%{}%", s);
                    params[0] = SqlValue::Str(pattern);
                }
                format!("{} NOT LIKE ?", col)
            }
            Token::In => format!("{} IN {}", col, value_sql),
            _ => unreachable!(),
        };

        Ok(SqlExpr { sql, params })
    }

    fn parse_primary(&mut self, this_entity_id: Option<&str>) -> Result<SqlExpr, String> {
        match self.peek().clone() {
            Token::LParen => {
                self.advance();
                let expr = self.parse_or(this_entity_id)?;
                match self.advance() {
                    Token::RParen => {}
                    other => return Err(format!("expected ')', got {:?}", other)),
                }
                Ok(SqlExpr {
                    sql: format!("({})", expr.sql),
                    params: expr.params,
                })
            }
            Token::Not => {
                self.advance();
                let inner = self.parse_primary(this_entity_id)?;
                Ok(SqlExpr {
                    sql: format!("NOT ({})", inner.sql),
                    params: inner.params,
                })
            }
            Token::Ident(_) => self.parse_comparison(this_entity_id),
            other => Err(format!("unexpected token {:?}", other)),
        }
    }

    fn parse_and(&mut self, this_entity_id: Option<&str>) -> Result<SqlExpr, String> {
        let mut left = self.parse_primary(this_entity_id)?;
        while matches!(self.peek(), Token::And) {
            self.advance();
            let right = self.parse_primary(this_entity_id)?;
            left.sql = format!("{} AND {}", left.sql, right.sql);
            left.params.extend(right.params);
        }
        Ok(left)
    }

    fn parse_or(&mut self, this_entity_id: Option<&str>) -> Result<SqlExpr, String> {
        let mut left = self.parse_and(this_entity_id)?;
        while matches!(self.peek(), Token::Or) {
            self.advance();
            let right = self.parse_and(this_entity_id)?;
            left.sql = format!("({}) OR ({})", left.sql, right.sql);
            left.params.extend(right.params);
        }
        Ok(left)
    }

    fn parse(&mut self, this_entity_id: Option<&str>) -> Result<SqlExpr, String> {
        let expr = self.parse_or(this_entity_id)?;
        if !matches!(self.peek(), Token::Eof) {
            return Err(format!("unexpected token after expression: {:?}", self.peek()));
        }
        Ok(expr)
    }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/// Validate LQL syntax. Returns `Ok(())` if valid, `Err(message)` if not.
pub fn validate_lql(query: &str) -> Result<(), String> {
    let tokens = tokenize(query)?;
    let mut parser = Parser::new(tokens);
    parser.parse(None)?;
    Ok(())
}

/// Translate an LQL query string into a SQL WHERE clause fragment plus bound parameters.
///
/// Returns `(sql_fragment, params)` where `sql_fragment` can be appended after `WHERE `
/// (or joined with other conditions using `AND`).
///
/// `this_entity_id` is the ID of the "current" entity for `{this}` variable resolution.
pub fn lql_to_sql(
    query: &str,
    this_entity_id: Option<&str>,
) -> Result<(String, Vec<SqlValue>), String> {
    let tokens = tokenize(query)?;
    let mut parser = Parser::new(tokens);
    let expr = parser.parse(this_entity_id)?;
    Ok((expr.sql, expr.params))
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn sql(q: &str) -> String {
        lql_to_sql(q, None).unwrap().0
    }

    fn sql_this(q: &str, id: &str) -> String {
        lql_to_sql(q, Some(id)).unwrap().0
    }

    #[test]
    fn test_simple_equality() {
        assert_eq!(sql("entity_type = 'person'"), "entity_type_slug = ?");
        assert_eq!(sql("name = 'Alice'"), "name = ?");
    }

    #[test]
    fn test_custom_field() {
        assert_eq!(
            sql("status = 'active'"),
            "json_extract(fields, '$.status') = ?"
        );
    }

    #[test]
    fn test_null_equality() {
        assert_eq!(sql("name = null"), "name IS NULL");
        assert_eq!(sql("name != null"), "name IS NOT NULL");
    }

    #[test]
    fn test_contains() {
        let (s, p) = lql_to_sql("name contains 'ali'", None).unwrap();
        assert_eq!(s, "name LIKE ?");
        assert!(matches!(&p[0], SqlValue::Str(v) if v == "%ali%"));
    }

    #[test]
    fn test_in_operator() {
        assert_eq!(
            sql("entity_type in ['person', 'team']"),
            "entity_type_slug IN (?, ?)"
        );
    }

    #[test]
    fn test_logical_and() {
        assert_eq!(
            sql("entity_type = 'person' and name contains 'alice'"),
            "entity_type_slug = ? AND name LIKE ?"
        );
    }

    #[test]
    fn test_logical_or() {
        let s = sql("entity_type = 'person' or entity_type = 'team'");
        assert_eq!(
            s,
            "(entity_type_slug = ?) OR (entity_type_slug = ?)"
        );
    }

    #[test]
    fn test_not() {
        assert_eq!(sql("not name = 'bob'"), "NOT (name = ?)");
    }

    #[test]
    fn test_parens() {
        let s = sql("(entity_type = 'person') and name = 'alice'");
        assert_eq!(s, "(entity_type_slug = ?) AND name = ?");
    }

    #[test]
    fn test_this_variable() {
        let s = sql_this("team = {this}", "ent_abc");
        assert_eq!(s, "json_extract(fields, '$.team') = ?");
        let (_, params) = lql_to_sql("team = {this}", Some("ent_abc")).unwrap();
        assert!(matches!(&params[0], SqlValue::Str(v) if v == "ent_abc"));
    }

    #[test]
    fn test_validate_lql_valid() {
        assert!(validate_lql("entity_type = 'person'").is_ok());
        assert!(validate_lql("name contains 'foo' and status = 'active'").is_ok());
    }

    #[test]
    fn test_validate_lql_invalid() {
        assert!(validate_lql("entity_type =").is_err());
        assert!(validate_lql("= 'value'").is_err());
        assert!(validate_lql("{unknown_var} = 'x'").is_err());
    }

    #[test]
    fn test_numeric_comparison() {
        assert_eq!(sql("age > 30"), "json_extract(fields, '$.age') > ?");
        let (_, p) = lql_to_sql("age > 30", None).unwrap();
        assert!(matches!(p[0], SqlValue::Num(n) if n == 30.0));
    }
}
