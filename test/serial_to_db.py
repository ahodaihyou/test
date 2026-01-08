import serial
import serial.tools.list_ports
import time
import requests  # 追加：サーバーに送る用
from pathlib import Path

BAUD = 115200
# サーバーのURL（今HTMLが送っている先と同じにする）
API_URL = "http://localhost:8081/value" 
OUT_CSV = Path("C:/Users/eizit/Documents/Python_Projects/sousei/log.csv")

def choose_port():
    ports = list(serial.tools.list_ports.comports())
    if not ports:
        raise RuntimeError("シリアルポートが見つかりません。")

    print("利用可能なポート:")
    for i, p in enumerate(ports):
        print(f"[{i}] {p.device}  {p.description}")

    # 自動選択（ポートが1つならそれを、複数なら入力）
    if len(ports) == 1:
        return ports[0].device
    idx = int(input("使うポート番号を入力: "))
    return ports[idx].device

def main():
    port = choose_port()
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    print(f"Open: {port} @ {BAUD}")
    print("Ctrl+C で終了")

    with serial.Serial(port, BAUD, timeout=1) as ser, open(OUT_CSV, "ab") as f:
        time.sleep(1.5)

        while True:
            line = ser.readline()
            if not line:
                continue

            # 1. ファイル保存
            f.write(line)
            f.flush()

            # 2. データの解析と送信
            try:
                # 文字列に変換して余計な空白を消す
                decoded_line = line.decode("utf-8", errors="replace").strip()
                print(f"Received: {decoded_line}")

                # 数値のみを取り出す（例: "25.5" -> 25）
                # 文字列が数値として解釈できる場合のみ送信
                if decoded_line.replace('.','',1).isdigit():
                    val = int(float(decoded_line))
                    
                    # 今のHTMLフォームと同じ形式でJSONを送る
                    payload = {
                        "value": val,
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    }
                    
                    response = requests.post(API_URL, json=payload)
                    if response.status_code == 200:
                        print(f"--> 送信成功: {val}")
                    else:
                        print(f"--> 送信失敗: {response.status_code}")

            except Exception as e:
                print(f"エラー: {e}")

if __name__ == "__main__":
    main()