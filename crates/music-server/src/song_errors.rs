//! Why a song failed, as the window shows it.
//!
//! Each reason has a code and fields: the window translates it by the code
//! (`app/i18n/songErrors.ts`), while the English text stays for the log, the hub
//! and agents. The hub groups failures by that text, so it is word for word the
//! text of before. A reason without a kind of its own travels as `Raw` and is
//! shown as it is. The codes are the same in every music studio; a studio adds
//! codes for its own engine and never renames these.

use std::fmt;

use serde_json::{json, Map, Value};

/// What the studio's engine server calls itself in its messages.
const ENGINE: &str = "mm-server";

#[derive(Debug, Clone, PartialEq)]
pub enum SongError {
    /// A reason with no kind of its own: shown as it is.
    Raw(String),
    PromptTooLong { tokens: u64, limit: u64 },
    KvCacheShort { needed: u64, tokens: u64, frames: u64, seconds: u64, max_seq: u64, suggest: u64 },
    TrainingOnCard,
    /// Lost with an engine that restarted: the card's memory ran out.
    LostVram,
    /// Lost with an engine that restarted: the computer's memory ran out.
    LostRam,
    /// Lost with an engine that restarted: the card failed, in the engine's own words when it gave any.
    LostDevice(Option<String>),
    /// Lost with an engine that restarted: a CUDA error, with the card it happened on.
    LostDeviceOnCard { detail: String, card: String, compute: String, driver: String, build: String },
    /// Lost with an engine that restarted, whose last line says where it was.
    LostAtLine(String),
    Lost,
    /// Lost with an engine that had ended with this exit code: its hex, what a Windows one means (a key the
    /// window translates), and the engine's last line when it left one.
    LostExit { exit: String, meaning: Option<&'static str>, line: Option<String> },
    /// Lost with an engine that could not listen on its port: `set` when MINIMAX_MM_SERVER_PORT names it, else
    /// another program took the port the studio chose, which `note` says when it was not the engine's own.
    LostPort { port: u16, set: bool, note: Option<String> },
    /// The engine gave the song up while loading the models: the card's memory ran out.
    LoadVram,
    /// The engine gave the song up while loading the models: the computer's memory ran out.
    LoadRam,
    /// The engine gave the song up with this FATAL line.
    EngineFatal(String),
    EngineFailed,
    EngineUnreachable(String),
    ImportFailed(String),
    OpenRouterNoModel,
    OpenRouterCatalogStale,
    OpenRouterFailed(String),
}

impl SongError {
    /// The code the window finds the translation by; `None` for a reason shown as it is.
    pub fn code(&self) -> Option<&'static str> {
        Some(match self {
            SongError::Raw(_) => return None,
            SongError::PromptTooLong { .. } => "prompt_too_long",
            SongError::KvCacheShort { .. } => "kv_cache_short",
            SongError::TrainingOnCard => "training_on_card",
            SongError::LostVram => "lost_vram",
            SongError::LostRam => "lost_ram",
            SongError::LostDevice(Some(_)) => "lost_device",
            SongError::LostDevice(None) => "lost_device_silent",
            SongError::LostDeviceOnCard { .. } => "lost_device_on_card",
            SongError::LostAtLine(_) => "lost_at_line",
            SongError::Lost => "lost",
            SongError::LostExit { line: Some(_), .. } => "lost_exit_at_line",
            SongError::LostExit { line: None, .. } => "lost_exit",
            SongError::LostPort { set: true, .. } => "lost_port_set",
            SongError::LostPort { set: false, .. } => "lost_port_taken",
            SongError::LoadVram => "load_vram",
            SongError::LoadRam => "load_ram",
            SongError::EngineFatal(_) => "engine_fatal",
            SongError::EngineFailed => "engine_failed",
            SongError::EngineUnreachable(_) => "engine_unreachable",
            SongError::ImportFailed(_) => "import_failed",
            SongError::OpenRouterNoModel => "openrouter_no_model",
            SongError::OpenRouterCatalogStale => "openrouter_catalog_stale",
            SongError::OpenRouterFailed(_) => "openrouter_failed",
        })
    }

    /// The fields put into the translation: counts, and the engine's or the network's own words.
    pub fn params(&self) -> Map<String, Value> {
        let mut params = Map::new();
        let mut put = |key: &str, value: Value| {
            params.insert(key.to_string(), value);
        };
        match self {
            SongError::PromptTooLong { tokens, limit } => {
                put("tokens", json!(tokens));
                put("limit", json!(limit));
                put("over", json!(tokens.saturating_sub(*limit)));
            }
            SongError::KvCacheShort { needed, tokens, frames, seconds, max_seq, suggest } => {
                put("needed", json!(needed));
                put("tokens", json!(tokens));
                put("frames", json!(frames));
                put("seconds", json!(seconds));
                put("max_seq", json!(max_seq));
                put("suggest", json!(suggest));
            }
            SongError::LostDevice(Some(detail))
            | SongError::EngineUnreachable(detail)
            | SongError::ImportFailed(detail)
            | SongError::OpenRouterFailed(detail) => put("detail", json!(detail)),
            SongError::LostAtLine(line) | SongError::EngineFatal(line) => put("line", json!(line)),
            SongError::LostDeviceOnCard { detail, card, compute, driver, build } => {
                put("detail", json!(detail));
                put("card", json!(card));
                put("compute", json!(compute));
                put("driver", json!(driver));
                put("build", json!(build));
            }
            SongError::LostExit { exit, meaning, line } => {
                put("exit", json!(exit));
                put("meaning", json!(meaning.unwrap_or("other")));
                if let Some(line) = line {
                    put("line", json!(line));
                }
            }
            SongError::LostPort { port, .. } => put("port", json!(port)),
            _ => {}
        }
        params
    }
}

impl fmt::Display for SongError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SongError::Raw(text) => f.write_str(text),
            SongError::PromptTooLong { tokens, limit } => write!(
                f,
                "The caption and lyrics are {tokens} tokens, over the model's limit of {limit}: shorten the caption or the lyrics by {} tokens.",
                tokens.saturating_sub(*limit)
            ),
            SongError::KvCacheShort { needed, tokens, frames, seconds, max_seq, suggest } => write!(
                f,
                "This song needs {needed} places in the language model's cache ({tokens} tokens of caption and lyrics and {frames} frames for {seconds} s of music), but the engine settings limit that cache (LM KV cache, --max-seq) to {max_seq}. Set it to {suggest} or more, or clear the field to use the model's full length."
            ),
            SongError::TrainingOnCard => f.write_str("a LoRA is training on the card; make songs once it finishes"),
            SongError::LostVram => f.write_str("The graphics card ran out of memory on this song and the engine restarted, so the song was lost. Choose a smaller model set in the model manager or a shorter song, and close whatever else uses the card; a card below the smallest set cannot make songs."),
            SongError::LostRam => f.write_str("The computer ran out of memory (RAM) on this song and the engine restarted, so the song was lost. Close other programs that take memory, or choose a smaller model set in the model manager or a shorter song."),
            SongError::LostDevice(Some(detail)) => write!(f, "The graphics card failed during this song ({detail}) and the engine restarted, so the song was lost. The engine log is in Settings, Engine."),
            SongError::LostDevice(None) => f.write_str("The graphics card failed during this song (a CUDA or driver error) and the engine restarted, so the song was lost. The engine log is in Settings, Engine."),
            SongError::LostDeviceOnCard { detail, card, compute, driver, build } => write!(f, "The graphics card failed during this song ({detail}) on {card}, compute {compute}, driver {driver}, {build} build and the engine restarted, so the song was lost. The engine log is in Settings, Engine."),
            SongError::LostAtLine(line) => write!(f, "The engine stopped during this song and restarted, so the song was lost; its last line was {line}. The engine log is in Settings, Engine."),
            SongError::Lost => f.write_str("The engine stopped during this song and restarted, so the song was lost. The engine log is in Settings, Engine."),
            SongError::LostExit { exit, meaning, line } => {
                let how = match meaning.and_then(exit_meaning_text) {
                    Some(meaning) => format!("{meaning}, exit code {exit}"),
                    None => format!("exit code {exit}"),
                };
                match line {
                    Some(line) => write!(f, "The engine stopped during this song ({how}) and restarted, so the song was lost; its last line was {line}. The engine log is in Settings, Engine."),
                    None => write!(f, "The engine stopped during this song ({how}) and restarted, so the song was lost. The engine log is in Settings, Engine."),
                }
            }
            SongError::LostPort { port, set: true, .. } => write!(f, "The engine could not listen on port {port}, which MINIMAX_MM_SERVER_PORT sets, so the song was lost: another program holds it. Close that program or set another port."),
            SongError::LostPort { port, set: false, note } => {
                let chosen = note.as_deref().map(|note| format!(" (At start {note}.)")).unwrap_or_default();
                write!(f, "The engine could not listen on port {port}, so the song was lost: another program took the port after the studio chose it.{chosen} Restart the studio: it chooses a free port at start.")
            }
            SongError::LoadVram => f.write_str("The graphics card ran out of memory while the engine was loading the models. Choose a smaller quantisation in the model manager, or close whatever else is using the card - the writing assistant holds several gigabytes of its own."),
            SongError::LoadRam => f.write_str("The computer ran out of memory (RAM) while the engine was loading the models. Close other programs that take memory, or choose a smaller quantisation in the model manager."),
            SongError::EngineFatal(line) => f.write_str(line),
            SongError::EngineFailed => write!(f, "{ENGINE} reported a failed job; its log has the reason."),
            SongError::EngineUnreachable(detail) => write!(f, "{ENGINE} stopped answering about this job: {detail}"),
            SongError::ImportFailed(detail) => write!(f, "{ENGINE} completed the job, but the studio could not safely import its result: {detail}"),
            SongError::OpenRouterNoModel => f.write_str("OpenRouter music requires a selected model from the refreshed catalog"),
            SongError::OpenRouterCatalogStale => f.write_str("Refresh the OpenRouter catalog before starting cloud music generation"),
            SongError::OpenRouterFailed(detail) => write!(f, "OpenRouter music generation failed: {detail}"),
        }
    }
}

/// What a Windows exit code (NTSTATUS, in hex without `0x`) of the engine means, as a key the window translates
/// (`exit_<key>` in `app/i18n/songErrors.ts`).
pub fn exit_meaning(code: &str) -> Option<&'static str> {
    Some(match code {
        "c0000005" => "access_violation",
        "c000001d" => "illegal_instruction",
        "c0000409" => "aborted",
        "c00000fd" => "stack_overflow",
        "c0000374" => "heap_corruption",
        "c0000135" | "c0000139" | "c0000142" => "library_missing",
        "c0000017" | "c000012d" => "out_of_memory",
        _ => return None,
    })
}

/// The English words of an exit meaning, for the log, the hub and agents.
fn exit_meaning_text(key: &str) -> Option<&'static str> {
    Some(match key {
        "access_violation" => "a crash: an access violation",
        "illegal_instruction" => "an instruction this processor does not have",
        "aborted" => "a crash: the engine aborted",
        "stack_overflow" => "a crash: a stack overflow",
        "heap_corruption" => "a crash: corrupted memory",
        "library_missing" => "a library of the engine did not load",
        "out_of_memory" => "the computer ran out of memory",
        _ => return None,
    })
}

impl From<String> for SongError {
    fn from(text: String) -> Self {
        SongError::Raw(text)
    }
}

impl From<&str> for SongError {
    fn from(text: &str) -> Self {
        SongError::Raw(text.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// One reason of each code. The `match` without a wildcard does not let a new kind be forgotten here.
    fn one_of_each() -> Vec<SongError> {
        let all = vec![
            SongError::Raw("x".into()),
            SongError::PromptTooLong { tokens: 5100, limit: 5000 },
            SongError::KvCacheShort { needed: 2275, tokens: 773, frames: 1500, seconds: 60, max_seq: 512, suggest: 2560 },
            SongError::TrainingOnCard,
            SongError::LostVram,
            SongError::LostRam,
            SongError::LostDevice(Some("x".into())),
            SongError::LostDevice(None),
            SongError::LostDeviceOnCard { detail: "x".into(), card: "x".into(), compute: "6.1".into(), driver: "581.29".into(), build: "cuda12".into() },
            SongError::LostAtLine("x".into()),
            SongError::Lost,
            SongError::LostExit { exit: "0xc000001d".into(), meaning: Some("illegal_instruction"), line: Some("x".into()) },
            SongError::LostExit { exit: "0x1".into(), meaning: None, line: None },
            SongError::LostPort { port: 8086, set: true, note: None },
            SongError::LostPort { port: 8087, set: false, note: Some("x".into()) },
            SongError::LoadVram,
            SongError::LoadRam,
            SongError::EngineFatal("x".into()),
            SongError::EngineFailed,
            SongError::EngineUnreachable("x".into()),
            SongError::ImportFailed("x".into()),
            SongError::OpenRouterNoModel,
            SongError::OpenRouterCatalogStale,
            SongError::OpenRouterFailed("x".into()),
        ];
        for error in &all {
            match error {
                SongError::Raw(_)
                | SongError::PromptTooLong { .. }
                | SongError::KvCacheShort { .. }
                | SongError::TrainingOnCard
                | SongError::LostVram
                | SongError::LostRam
                | SongError::LostDevice(_)
                | SongError::LostDeviceOnCard { .. }
                | SongError::LostAtLine(_)
                | SongError::Lost
                | SongError::LostExit { .. }
                | SongError::LostPort { .. }
                | SongError::LoadVram
                | SongError::LoadRam
                | SongError::EngineFatal(_)
                | SongError::EngineFailed
                | SongError::EngineUnreachable(_)
                | SongError::ImportFailed(_)
                | SongError::OpenRouterNoModel
                | SongError::OpenRouterCatalogStale
                | SongError::OpenRouterFailed(_) => {}
            }
        }
        all
    }

    /// Each code is translated into every language of the window: a code without a translation fails here.
    #[test]
    fn every_code_has_a_translation_in_every_language() {
        let dictionary = include_str!("../../../app/i18n/songErrors.ts");
        let mut missing = Vec::new();
        for error in one_of_each() {
            let Some(code) = error.code() else { continue };
            let found = dictionary.matches(&format!("\n  {code}:")).count();
            if found != 5 {
                missing.push(format!("{code}: {found} of 5"));
            }
            for key in error.params().keys() {
                let named = dictionary.matches(&format!("{{{key}}}")).count();
                if named == 0 {
                    missing.push(format!("{code}: no translation uses {{{key}}}"));
                }
            }
        }
        assert!(missing.is_empty(), "without a translation: {missing:?}");
    }

    /// Every meaning of an exit code, and the one for a code without a meaning, has its words in every language.
    #[test]
    fn every_exit_meaning_has_a_translation_in_every_language() {
        let dictionary = include_str!("../../../app/i18n/songErrors.ts");
        let codes = ["c0000005", "c000001d", "c0000409", "c00000fd", "c0000374", "c0000135", "c0000017"];
        let keys: Vec<&str> = codes.iter().filter_map(|code| exit_meaning(code)).chain(["other"]).collect();
        assert_eq!(keys.len(), codes.len() + 1);
        for key in keys {
            assert_eq!(dictionary.matches(&format!("\n  exit_{key}:")).count(), 5, "exit_{key}");
        }
        let crashed = SongError::LostExit { exit: "0xc000001d".into(), meaning: exit_meaning("c000001d"), line: Some("[AR] Frame 3".into()) };
        assert_eq!(crashed.to_string(), "The engine stopped during this song (an instruction this processor does not have, exit code 0xc000001d) and restarted, so the song was lost; its last line was [AR] Frame 3. The engine log is in Settings, Engine.");
    }

    #[test]
    fn the_english_text_stays_what_the_hub_already_groups_by() {
        assert_eq!(
            SongError::ImportFailed("error sending request for url (x)".into()).to_string(),
            "mm-server completed the job, but the studio could not safely import its result: error sending request for url (x)"
        );
        assert_eq!(
            SongError::LostVram.to_string(),
            "The graphics card ran out of memory on this song and the engine restarted, so the song was lost. Choose a smaller model set in the model manager or a shorter song, and close whatever else uses the card; a card below the smallest set cannot make songs."
        );
        assert_eq!(SongError::EngineFatal("kv_len 773 > max_seq 512".into()).to_string(), "kv_len 773 > max_seq 512");
        let short = SongError::KvCacheShort { needed: 1575, tokens: 73, frames: 1500, seconds: 60, max_seq: 512, suggest: 2048 };
        assert_eq!(short.code(), Some("kv_cache_short"));
        assert_eq!(short.params()["suggest"], 2048);
        assert_eq!(SongError::Raw("x".into()).code(), None);
    }
}
