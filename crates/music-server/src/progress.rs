//! Generation progress read from the engine log.
//!
//! mm-server reports a job as `running` and nothing finer; its log counts the
//! autoregressive frames against their budget and the diffusion windows. The
//! autoregressive pass is about the first half of the work, the diffusion pass
//! the second.

use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Stage {
    /// The language model writing the audio frames.
    Frames,
    /// The flow-matching DiT rendering the frames, window by window.
    Diffusion,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Progress {
    pub stage: Stage,
    /// Overall fraction of the job, 0 to 1.
    pub fraction: f64,
    /// The stage's own counter, e.g. `412/750`.
    pub detail: String,
}

const FRAMES: (f64, f64) = (0.0, 0.5);
const DIFFUSION: (f64, f64) = (0.5, 1.0);

fn counter(line: &str, prefix: &str) -> Option<(f64, f64)> {
    let rest = line.strip_prefix(prefix)?.trim_start();
    let token = rest.split(|c: char| c == ',' || c == ':' || c.is_whitespace()).next()?;
    let (done, total) = token.split_once('/')?;
    let done: f64 = done.parse().ok()?;
    let total: f64 = total.parse().ok()?;
    (total > 0.0).then_some((done, total))
}

fn band((start, end): (f64, f64), fraction: f64) -> f64 {
    start + (end - start) * fraction.clamp(0.0, 1.0)
}

/// The progress after one more line of the engine log: a counter moves it, the
/// end of a job clears it, any other line leaves it as it was.
pub fn step(current: Option<Progress>, line: &str) -> Option<Progress> {
    let line = line.trim();
    if line.starts_with("[Done]") || line.starts_with("[Server] Cancel") || line.contains("FATAL") {
        None
    } else if let Some((done, total)) = counter(line, "[AR] Frame") {
        Some(Progress { stage: Stage::Frames, fraction: band(FRAMES, done / total), detail: format!("{done}/{total}") })
    } else if let Some((done, total)) = counter(line, "[DiT] Window") {
        Some(Progress { stage: Stage::Diffusion, fraction: band(DIFFUSION, done / total), detail: format!("{done}/{total}") })
    } else {
        current
    }
}

/// The progress of the job the engine is running now, or `None` when the last
/// thing the log says is that it finished, failed or was cancelled.
#[cfg(test)]
pub fn from_log(lines: &[String]) -> Option<Progress> {
    lines.iter().fold(None, |current, line| step(current, line))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lines(text: &str) -> Vec<String> {
        text.lines().map(str::to_owned).collect()
    }

    #[test]
    fn frames_fill_the_first_half_and_windows_the_second() {
        let frames = from_log(&lines("[AR] Prefill 120 ms, 812 tokens, CFG=1.50, top_k=50, songs=1\n[AR] Frame 250/1000")).unwrap();
        assert_eq!(frames.stage, Stage::Frames);
        assert!((frames.fraction - 0.125).abs() < 1e-9);

        let windows = from_log(&lines("[AR] Frame 1000/1000\n[DiT] Window 2/4: T=750, 30 steps, 900 ms (30.0 ms/step)")).unwrap();
        assert_eq!(windows.stage, Stage::Diffusion);
        assert!((windows.fraction - 0.75).abs() < 1e-9);
    }

    #[test]
    fn a_line_without_a_counter_moves_nothing() {
        let log = lines("[AR] Frame 500/1000\n[AR] Frame budget clamped to 900 by the KV cache (prompt 812 tokens)");
        assert!((from_log(&log).unwrap().fraction - 0.25).abs() < 1e-9);
    }

    #[test]
    fn a_finished_or_cancelled_job_is_not_progress() {
        assert!(from_log(&lines("[DiT] Window 4/4: T=750\n[Done] 42.0 s total")).is_none());
        assert!(from_log(&lines("[AR] Frame 10/1000\n[Server] Cancel requested for job 7f91")).is_none());
        assert!(from_log(&lines("[AR] Frame 10/1000\n[Pipeline] FATAL: out of memory")).is_none());
        assert!(from_log(&[]).is_none());
    }
}
