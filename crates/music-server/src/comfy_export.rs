//! A MiniMax Music3 adapter as one ComfyUI LoRA file.
//!
//! The studio's trainer writes a PEFT LoRA of the language model (Qwen3-8B)
//! as two files: `adapter_model.safetensors` with keys
//! `base_model.model.model.layers.N.<module>.lora_A|lora_B.weight`, and
//! `adapter_config.json` with the alpha the scale comes from. ComfyUI loads
//! the language model as MiniMax's text encoder, its projections kept apart
//! (`model.layers.N.self_attn.q_proj`, ...), so the LoRA carries over as it
//! is: the keys under `text_encoders.`, and the alpha of each module written
//! into the file, since ComfyUI reads no adapter_config.json. The trainer's
//! artist token - a learned prompt vector - has no place in a ComfyUI LoRA
//! and is left out; the file says so.

use std::collections::BTreeMap;
use std::path::Path;

use anyhow::{bail, Context, Result};
use serde_json::{Map, Value};

/// One tensor read from a safetensors file, as F32.
#[derive(Debug, Clone)]
pub struct Tensor {
    pub shape: Vec<usize>,
    pub data: Vec<f32>,
}

impl Tensor {
    fn rows(&self) -> usize {
        self.shape.first().copied().unwrap_or(1)
    }

    fn cols(&self) -> usize {
        self.shape.get(1).copied().unwrap_or(1)
    }

    fn at(&self, row: usize, col: usize) -> f32 {
        self.data[row * self.cols() + col]
    }
}

/// A safetensors file: its tensors as F32 and its metadata.
pub struct SafeTensors {
    pub tensors: BTreeMap<String, Tensor>,
    pub metadata: Map<String, Value>,
}

pub fn read(path: &Path) -> Result<SafeTensors> {
    let bytes = std::fs::read(path).with_context(|| format!("read {}", path.display()))?;
    let length = u64::from_le_bytes(bytes.get(..8).context("not a safetensors file")?.try_into()?) as usize;
    let header: Map<String, Value> = serde_json::from_slice(bytes.get(8..8 + length).context("a safetensors header past the end of the file")?)?;
    let data = &bytes[8 + length..];
    let mut tensors = BTreeMap::new();
    let mut metadata = Map::new();
    for (name, entry) in header {
        if name == "__metadata__" {
            metadata = entry.as_object().cloned().unwrap_or_default();
            continue;
        }
        let dtype = entry.get("dtype").and_then(Value::as_str).context("a tensor without a dtype")?;
        let shape: Vec<usize> = entry.get("shape").and_then(Value::as_array).context("a tensor without a shape")?.iter().filter_map(Value::as_u64).map(|size| size as usize).collect();
        let offsets: Vec<usize> = entry.get("data_offsets").and_then(Value::as_array).context("a tensor without offsets")?.iter().filter_map(Value::as_u64).map(|offset| offset as usize).collect();
        let raw = data.get(offsets[0]..offsets[1]).with_context(|| format!("{name} lies past the end of the file"))?;
        let values = match dtype {
            "F32" => raw.chunks_exact(4).map(|b| f32::from_le_bytes([b[0], b[1], b[2], b[3]])).collect(),
            "BF16" => raw.chunks_exact(2).map(|b| f32::from_bits((u16::from_le_bytes([b[0], b[1]]) as u32) << 16)).collect(),
            "F16" => raw.chunks_exact(2).map(|b| f16_to_f32(u16::from_le_bytes([b[0], b[1]]))).collect(),
            other => bail!("{name} is {other}; only F32, BF16 and F16 adapters are read"),
        };
        tensors.insert(name, Tensor { shape, data: values });
    }
    Ok(SafeTensors { tensors, metadata })
}

/// Writes BF16 tensors, as trainers ship LoRA, with the metadata as text.
pub fn write(path: &Path, tensors: &BTreeMap<String, Tensor>, metadata: &BTreeMap<String, String>) -> Result<()> {
    let mut header = Map::new();
    header.insert("__metadata__".into(), serde_json::to_value(metadata)?);
    let mut offset = 0usize;
    for (name, tensor) in tensors {
        let size = tensor.data.len() * 2;
        header.insert(name.clone(), serde_json::json!({ "dtype": "BF16", "shape": tensor.shape, "data_offsets": [offset, offset + size] }));
        offset += size;
    }
    let mut json = serde_json::to_vec(&header)?;
    while json.len() % 8 != 0 {
        json.push(b' ');
    }
    let mut out = Vec::with_capacity(8 + json.len() + offset);
    out.extend_from_slice(&(json.len() as u64).to_le_bytes());
    out.extend_from_slice(&json);
    for tensor in tensors.values() {
        for value in &tensor.data {
            out.extend_from_slice(&f32_to_bf16(*value).to_le_bytes());
        }
    }
    let partial = path.with_extension("safetensors.part");
    std::fs::write(&partial, out).with_context(|| format!("write {}", partial.display()))?;
    std::fs::rename(&partial, path).with_context(|| format!("move into {}", path.display()))?;
    Ok(())
}

fn f16_to_f32(bits: u16) -> f32 {
    let sign = ((bits >> 15) as u32) << 31;
    let exponent = ((bits >> 10) & 0x1f) as u32;
    let mantissa = (bits & 0x3ff) as u32;
    let value = match (exponent, mantissa) {
        (0, 0) => sign,
        (0, _) => {
            let mut e = 127 - 15 + 1;
            let mut m = mantissa;
            while m & 0x400 == 0 {
                m <<= 1;
                e -= 1;
            }
            sign | (e << 23) | ((m & 0x3ff) << 13)
        }
        (0x1f, _) => sign | 0x7f80_0000 | (mantissa << 13),
        _ => sign | ((exponent + 127 - 15) << 23) | (mantissa << 13),
    };
    f32::from_bits(value)
}

/// Round to nearest even, as torch casts to bfloat16.
fn f32_to_bf16(value: f32) -> u16 {
    let bits = value.to_bits();
    if value.is_nan() {
        return 0x7fc0;
    }
    let rounding = 0x7fff + ((bits >> 16) & 1);
    ((bits + rounding) >> 16) as u16
}


/// What adapter_config.json says of the scale: lora_alpha (per module when
/// alpha_pattern names it) and r, and whether it is rsLoRA; a module's own
/// rank is read from its lora_A.
struct PeftScale {
    alpha: f32,
    rank: f32,
    rslora: bool,
    alpha_pattern: Map<String, Value>,
}

impl PeftScale {
    fn read(config: &Path) -> Result<Self> {
        let json: Value = serde_json::from_slice(&std::fs::read(config).with_context(|| format!("read {}", config.display()))?)?;
        let number = |key: &str| json.get(key).and_then(Value::as_f64).map(|value| value as f32);
        let rank = number("r").context("adapter_config.json has no r")?;
        Ok(Self {
            alpha: number("lora_alpha").unwrap_or(rank),
            rank,
            rslora: json.get("use_rslora").and_then(Value::as_bool).unwrap_or(false),
            alpha_pattern: json.get("alpha_pattern").and_then(Value::as_object).cloned().unwrap_or_default(),
        })
    }

    /// The alpha that gives ComfyUI's alpha / rank the scale PEFT applies to
    /// this module, times the strength.
    fn comfy_alpha(&self, module: &str, rank: f32, strength: f32) -> f32 {
        let pick = |pattern: &Map<String, Value>, fallback: f32| {
            pattern.iter().find(|(key, _)| module.ends_with(key.as_str())).and_then(|(_, value)| value.as_f64()).map_or(fallback, |value| value as f32)
        };
        let alpha = pick(&self.alpha_pattern, self.alpha);
        let scale = if self.rslora { alpha / rank.sqrt() } else { alpha / rank };
        scale * rank * strength
    }
}

/// The trained LoRA in `folder` as one ComfyUI LoRA at `out`. Returns how
/// many tensors were written and how many were left out.
pub fn export_minimax(folder: &Path, strength: f32, out: &Path, name: &str, trigger: Option<&str>) -> Result<(usize, usize)> {
    let weights = read(&folder.join("adapter_model.safetensors"))?;
    let scale = PeftScale::read(&folder.join("adapter_config.json"))?;
    let mut tensors = BTreeMap::new();
    let mut left_out = 0usize;
    let mut alphas: BTreeMap<String, f32> = BTreeMap::new();
    for (key, tensor) in &weights.tensors {
        let Some(rest) = key.strip_prefix("base_model.model.") else {
            left_out += 1;
            continue;
        };
        let Some((module, _)) = rest.split_once(".lora_") else {
            left_out += 1;
            continue;
        };
        let side = if key.contains(".lora_A.") { "lora_A" } else if key.contains(".lora_B.") { "lora_B" } else { bail!("{key} is neither lora_A nor lora_B") };
        if side == "lora_A" {
            alphas.insert(module.to_string(), scale.comfy_alpha(module, tensor.rows() as f32, strength));
        }
        tensors.insert(format!("text_encoders.{module}.{side}.weight"), tensor.clone());
    }
    if tensors.is_empty() {
        bail!("the adapter has no LoRA tensors");
    }
    for (module, alpha) in alphas {
        tensors.insert(format!("text_encoders.{module}.alpha"), Tensor { shape: vec![], data: vec![alpha] });
    }
    let mut metadata = BTreeMap::new();
    metadata.insert("format".to_string(), "pt".to_string());
    metadata.insert("base_model".to_string(), "MiniMax Music3 language model (ComfyUI text encoder)".to_string());
    metadata.insert("name".to_string(), name.to_string());
    if left_out > 0 {
        metadata.insert("left_out".to_string(), format!("{left_out} tensors that are not LoRA (the trainer's artist token) - ComfyUI's LoRA loader has no place for them"));
    }
    if let Some(trigger) = trigger.filter(|trigger| !trigger.trim().is_empty()) {
        metadata.insert("modelspec.trigger_phrase".to_string(), trigger.to_string());
    }
    let count = tensors.len();
    write(out, &tensors, &metadata)?;
    Ok((count, left_out))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_peft_scale_becomes_the_alpha_comfyui_divides_by_the_rank() {
        let scale = PeftScale { alpha: 32.0, rank: 16.0, rslora: false, alpha_pattern: Map::new() };
        assert_eq!(scale.comfy_alpha("model.layers.0.self_attn.q_proj", 16.0, 1.0), 32.0);
        assert_eq!(scale.comfy_alpha("model.layers.0.self_attn.q_proj", 16.0, 0.5), 16.0);
        let rs = PeftScale { rslora: true, ..scale };
        assert_eq!(rs.comfy_alpha("x", 16.0, 1.0), 32.0 / 4.0 * 16.0);
    }
}
