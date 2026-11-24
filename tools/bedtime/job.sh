# Runs on a Hugging Face GPU job (a10g-small, image pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime) with
# Harshith's bucket mounted:  -v hf://buckets/HarshithReddy05/tirumala-reel:/b  and secret HF_TOKEN.
# Extra arguments limit it to some story ids.
set -e
apt-get update -qq && apt-get install -y -qq ffmpeg git > /dev/null
mkdir -p /work && cd /work
git clone -q --depth 1 https://github.com/Dattaharshithreddy/Swaram.git
git clone -q --depth 1 https://github.com/AI4Bharat/IndicF5.git
git clone -q --depth 1 https://github.com/Dattaharshithreddy/maatalu.git
pip install -q x-transformers torchdiffeq vocos==0.1.0 einops jieba pypinyin ema-pytorch librosa soundfile safetensors onnx onnxruntime \
  accelerate datasets matplotlib wandb tqdm "numpy>=2,<2.3" 2>&1 | tail -2
pip uninstall -y -q torchvision || true
export PYTHONPATH=/work/IndicF5:/work/IndicF5/src:/work/Swaram/edge
python maatalu/tools/bedtime/narrate.py maatalu/tools/bedtime/stories.json "$@"
