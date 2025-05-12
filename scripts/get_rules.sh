# 下载 rules 数据

data_raw_url="https://github.com/ClearURLs/Rules/raw/refs/heads/master/data.min.json"
filepath="./data/data.min.json"
# 如果不存在就下载数据
if [ ! -f "$filepath" ]; then
    echo "Downloading data from $data_raw_url to $filepath"
    curl -L "$data_raw_url" -o "$filepath"
else
    echo "Data already exists at $filepath"
fi
