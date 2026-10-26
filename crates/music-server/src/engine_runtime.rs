//! The CUDA libraries the music engine is linked against.
//!
//! The engine loads one of two CUDA backends at run time, `cuda13\ggml-cuda.dll`
//! or `cuda12\ggml-cuda.dll`, whichever the card and its driver run (see
//! `cuda_build`). Each imports its own cuBLAS, `cublas64_13.dll` or
//! `cublas64_12.dll`, which imports `cublasLt64_1x.dll`. The loader resolves
//! them from the executable's folder, so they go beside `mm-server.exe`, and
//! the two majors never clash by name. A missing cuBLAS fails the backend
//! load, and the engine stops on it.
//!
//! The two libraries are 512 MB unpacked, which is four times the rest of the
//! installer, so they are not shipped - they are fetched from NVIDIA's own
//! redistributable archive the first time the engine is asked to start, the
//! same way the models are. The build machine has them on PATH through the CUDA
//! Toolkit, which is exactly why this was invisible until someone without the
//! Toolkit ran the release.

use std::path::{Path, PathBuf};

use anyhow::{bail, Context, Result};

use crate::cuda_build::CudaBuild;
use crate::downloads::{Asset, AssetKind, Downloader};

/// The libraries of each build, by file name, exactly as its ggml-cuda.dll
/// imports them. The CUDA major is part of the name, so a rebuild on another
/// major is a change here, and the import check in `dll_imports` catches it.
pub const CUDA13_LIBRARIES: [&str; 2] = ["cublas64_13.dll", "cublasLt64_13.dll"];
pub const CUDA12_LIBRARIES: [&str; 2] = ["cublas64_12.dll", "cublasLt64_12.dll"];

/// The Visual C++ runtime the engine, ggml and the ONNX Runtime the studio
/// loads are compiled against, by the names in their import tables:
/// onnxruntime.dll imports msvcp140_1.dll.
pub const VC_RUNTIME_LIBRARIES: [&str; 5] =
    ["vcruntime140.dll", "vcruntime140_1.dll", "msvcp140.dll", "msvcp140_1.dll", "vcomp140.dll"];

/// Microsoft's own permanent link to the current x64 redistributable.
const VC_REDIST_URL: &str = "https://aka.ms/vs/17/release/vc_redist.x64.exe";

#[cfg(test)]
pub const ASSETS: &[Asset] = &[CUBLAS13, CUBLAS12];

const CUBLAS13: Asset = Asset {
    id: "engine-cuda-cublas",
    label: "NVIDIA cuBLAS 13.5",
    kind: AssetKind::Runtime,
    // NVIDIA's redistributable archive, the same one every CUDA application
    // ships from. The size and the digest are published in
    // redist/redistrib_13.3.0.json; the size below was confirmed against a
    // live HEAD request, which also confirmed range support.
    url: "https://developer.download.nvidia.com/compute/cuda/redist/libcublas/windows-x86_64/libcublas-windows-x86_64-13.5.1.27-archive.zip",
    relative_path: "cuda-cublas.zip",
    bytes: 391_055_517,
    // No sub-directory: the libraries go straight in beside mm-server.exe,
    // which is where the Windows loader looks first and what NVIDIA's own
    // deployment guide recommends.
    unzip_into: None,
    marker: "cublasLt64_13.dll",
    pick: &CUDA13_LIBRARIES,
    vram_gb: None,
    note: "The linear algebra the engine's CUDA backend is linked against. Without it the engine cannot start at all.",
};

const CUBLAS12: Asset = Asset {
    id: "engine-cuda12-cublas",
    label: "NVIDIA cuBLAS 12.9",
    kind: AssetKind::Runtime,
    // The cuBLAS of the CUDA 12.9 toolkit the CUDA 12 backend is built with.
    // Size from redist/redistrib_12.9.1.json, confirmed by a HEAD request.
    url: "https://developer.download.nvidia.com/compute/cuda/redist/libcublas/windows-x86_64/libcublas-windows-x86_64-12.9.1.4-archive.zip",
    relative_path: "cuda12-cublas.zip",
    bytes: 549_755_186,
    unzip_into: None,
    marker: "cublasLt64_12.dll",
    pick: &CUDA12_LIBRARIES,
    vram_gb: None,
    note: "The linear algebra of the engine's CUDA 12 backend, for cards CUDA 13 dropped and older drivers.",
};

/// The cuBLAS a CUDA build loads.
pub fn cublas_asset(build: CudaBuild) -> &'static Asset {
    match build {
        CudaBuild::Cuda13 => &CUBLAS13,
        CudaBuild::Cuda12 => &CUBLAS12,
    }
}

/// The engine's downloadable runtime.
pub struct EngineRuntime {
    downloader: Downloader,
}

impl EngineRuntime {
    /// Takes the directory `mm-server.exe` lives in: the libraries belong
    /// beside the binary that imports them, not in a folder of their own.
    /// Where that directory cannot be written - an installation under Program
    /// Files - they go to the studio's data folder instead, which joins PATH:
    /// the engine inherits it, and Windows looks there for what its backend imports.
    pub fn new(bundle_root: &Path, data_root: &Path) -> Self {
        let root = if writable(bundle_root) {
            bundle_root.to_path_buf()
        } else {
            let elsewhere = data_root.join("engine-runtime");
            let existing = std::env::var_os("PATH").unwrap_or_default();
            if let Ok(joined) = std::env::join_paths(std::iter::once(elsewhere.clone()).chain(std::env::split_paths(&existing))) {
                unsafe { std::env::set_var("PATH", joined) };
            }
            elsewhere
        };
        Self { downloader: Downloader::new(root) }
    }

    pub fn downloader(&self) -> &Downloader {
        &self.downloader
    }

    /// Where the libraries live once installed - beside the engine.
    pub fn library_dir(&self) -> PathBuf {
        self.downloader.root().to_path_buf()
    }

    /// Whether the engine will find every library it imports.
    ///
    /// The Visual C++ runtime counts too: a machine that already has cuBLAS
    /// but no redistributable has nothing to download and still cannot start
    /// the engine, and checking only the downloads would have skipped the
    /// install entirely.
    pub fn is_ready(&self, build: CudaBuild) -> bool {
        self.missing(build).is_empty() && vc_runtime_present()
    }

    /// What is still missing, so a caller can report the size before starting.
    ///
    /// A machine that already has the libraries on its search path - a CUDA
    /// Toolkit installation - downloads nothing: the engine inherits that path
    /// and finds them there.
    pub fn missing(&self, build: CudaBuild) -> Vec<&'static Asset> {
        let asset = cublas_asset(build);
        if self.downloader.is_installed(asset) || asset.pick.iter().all(|library| is_on_the_search_path(library)) {
            return Vec::new();
        }
        vec![asset]
    }

    /// Fetches whatever is missing and waits for it.
    pub async fn install_missing(&self, build: CudaBuild) -> Result<()> {
        ensure_vc_runtime().await?;
        self.downloader.install_all("engine", &self.missing(build)).await
    }
}

/// Whether the Visual C++ runtime the engine needs is already installed.
///
/// Almost every Windows machine has it - some game or application put it there
/// years ago - so this is checked, not assumed in either direction.
#[cfg(windows)]
pub fn vc_runtime_present() -> bool {
    VC_RUNTIME_LIBRARIES.iter().all(|library| is_on_the_search_path(library))
}

/// Off Windows the engine is built against the platform's own runtime (libc++
/// and the system libraries), which is always present: nothing to check.
#[cfg(not(windows))]
pub fn vc_runtime_present() -> bool {
    true
}

/// Installs Microsoft's redistributable when, and only when, it is missing.
///
/// This is the ordinary way an application ships against the Visual C++
/// runtime: Microsoft publishes one installer at a permanent link, and it is
/// run once. It asks for administrator rights, shows its own progress, and
/// returns 3010 when it wants a restart - which is a success, not a failure.
pub async fn ensure_vc_runtime() -> Result<()> {
    if !cfg!(windows) || vc_runtime_present() {
        return Ok(());
    }
    let installer = std::env::temp_dir().join("vc_redist.x64.exe");
    let bytes = crate::net::download_client()
        .get(VC_REDIST_URL)
        .send()
        .await
        .context("download the Visual C++ redistributable")?
        .error_for_status()
        .context("download the Visual C++ redistributable")?
        .bytes()
        .await
        .context("read the Visual C++ redistributable")?;
    std::fs::write(&installer, &bytes).with_context(|| format!("write {}", installer.display()))?;

    let status = tokio::task::spawn_blocking(move || {
        std::process::Command::new(&installer).args(["/install", "/passive", "/norestart"]).status()
    })
    .await
    .context("run the Visual C++ redistributable")?
    .context("run the Visual C++ redistributable")?;
    match status.code() {
        // 0: installed. 1638: a newer one is already there. 3010: installed,
        // wants a restart it will not get from us and does not need.
        Some(0) | Some(1638) | Some(3010) => Ok(()),
        Some(code) => bail!("the Visual C++ redistributable installer ended with {code}"),
        None => bail!("the Visual C++ redistributable installer was interrupted"),
    }
}

/// Whether files can be written into `directory`, found by writing one.
fn writable(directory: &Path) -> bool {
    if std::fs::create_dir_all(directory).is_err() {
        return false;
    }
    let probe = directory.join(format!(".write-probe-{}", std::process::id()));
    let written = std::fs::write(&probe, b"").is_ok();
    let _ = std::fs::remove_file(&probe);
    written
}

/// Whether the loader would already find this library without help.
///
/// The engine inherits this process's PATH, so the directories searched there
/// are the directories searched here. A machine with the CUDA Toolkit
/// installed has cuBLAS on PATH already, and asking it to download half a
/// gigabyte of the same thing would be rude.
fn is_on_the_search_path(library: &str) -> bool {
    let Some(path) = std::env::var_os("PATH") else { return false };
    std::env::split_paths(&path).any(|directory| directory.join(library).is_file())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn libraries_go_to_the_data_folder_when_the_engine_folder_cannot_be_written() {
        let data = std::env::temp_dir().join(format!("engine-runtime-{}", uuid::Uuid::now_v7()));
        std::fs::create_dir_all(&data).unwrap();
        std::fs::write(data.join("a-file"), b"").unwrap();
        // a folder inside a file can be neither made nor written, as Program Files cannot without elevation
        let runtime = EngineRuntime::new(&data.join("a-file").join("engine"), &data);
        assert_eq!(runtime.library_dir(), data.join("engine-runtime"));
        let writable = data.join("install");
        std::fs::create_dir_all(&writable).unwrap();
        assert_eq!(EngineRuntime::new(&writable, &data).library_dir(), writable);
        std::fs::remove_dir_all(&data).ok();
    }

    /// The file names are the contract with the engine binary: they are what
    /// the import table asks the loader for, and what `pick` takes out of the
    /// archive. A typo here is a download that finishes and changes nothing.
    #[test]
    fn every_imported_library_is_picked_out_of_the_archive() {
        for (build, libraries, major) in
            [(CudaBuild::Cuda13, CUDA13_LIBRARIES, "13"), (CudaBuild::Cuda12, CUDA12_LIBRARIES, "12")]
        {
            let asset = cublas_asset(build);
            for library in libraries {
                assert!(library.contains(major), "{library} does not name CUDA {major}");
                assert!(asset.pick.contains(&library), "{library} is imported by {build:?} but never taken out of its archive");
            }
            assert!(asset.url.contains(&format!("-{major}.")), "{} is not a CUDA {major} cuBLAS", asset.url);
        }
    }

    /// A runtime asset that unpacks nowhere would download and vanish.
    #[test]
    fn the_libraries_land_in_one_directory_the_engine_can_be_pointed_at() {
        for asset in ASSETS {
            // Straight into the bundle: a sub-directory would put them
            // somewhere the loader does not look.
            assert_eq!(asset.unzip_into, None);
            assert_eq!(asset.kind, AssetKind::Runtime);
            assert!(asset.bytes > 0, "{} has no size, so nothing can report progress", asset.id);
        }
    }

    /// The libraries count as installed only once they are beside the engine.
    ///
    /// This asserts on the downloader rather than on `is_ready`, because a
    /// machine with the CUDA Toolkit is ready without downloading anything -
    /// which is the point of the PATH check, and would make the test lie about
    /// what it proved.
    #[test]
    fn the_libraries_count_as_installed_only_beside_the_engine() {
        let root = std::env::temp_dir().join(format!("engine-runtime-{}", uuid::Uuid::now_v7()));
        let runtime = EngineRuntime::new(&root, &root);
        let asset = cublas_asset(CudaBuild::Cuda13);
        assert!(!runtime.downloader().is_installed(asset));
        assert_eq!(runtime.library_dir(), root);

        std::fs::create_dir_all(runtime.library_dir()).unwrap();
        for library in CUDA13_LIBRARIES {
            std::fs::write(runtime.library_dir().join(library), b"x").unwrap();
        }
        assert!(!runtime.downloader().is_installed(asset), "libraries without the record of their pin are not taken for it");
        let unpacked: Vec<_> = CUDA13_LIBRARIES.iter().map(|library| runtime.library_dir().join(library)).collect();
        crate::install_record::write(&runtime.downloader().record_of(asset), asset.url, "", &unpacked, runtime.downloader().root()).unwrap();
        assert!(runtime.downloader().is_installed(asset));
        assert!(runtime.missing(CudaBuild::Cuda13).is_empty());
        // The other build asks for its own cuBLAS, unless PATH has it.
        if !CUDA12_LIBRARIES.iter().all(|library| is_on_the_search_path(library)) {
            assert_eq!(runtime.missing(CudaBuild::Cuda12).len(), 1);
        }
        std::fs::remove_dir_all(&root).ok();
    }
}
