import os
import sys
import webbrowser
import threading
import pystray
from PIL import Image
from flask import Flask, render_template, send_from_directory
import socket
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def find_free_port():
    """找到一个可用的端口"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

# 获取资源文件路径
def resource_path(relative_path):
    """获取资源的绝对路径"""
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# 创建系统托盘图标
def create_icon():
    # 创建一个简单的图标（可以替换为自己的图标文件）
    icon_image = Image.new('RGB', (64, 64), color='white')
    
    def on_quit(icon, item):
        icon.stop()
        os._exit(0)

    # 创建托盘图标
    icon = pystray.Icon(
        "watermark_editor",
        icon_image,
        "水印编辑器",
        menu=pystray.Menu(
            pystray.MenuItem("退出", on_quit)
        )
    )
    return icon

@app.route('/')
def index():
    return render_template('index.html')

def run_flask(port):
    """运行Flask应用"""
    try:
        app.run(port=port, threaded=True)
    except Exception as e:
        logger.error(f"Flask应用启动失败: {e}")
        os._exit(1)

def main():
    try:
        # 找到可用端口
        port = find_free_port()
        
        # 启动Flask线程
        flask_thread = threading.Thread(target=run_flask, args=(port,))
        flask_thread.daemon = True
        flask_thread.start()

        # 创建并运行系统托盘图标
        icon = create_icon()
        icon_thread = threading.Thread(target=icon.run)
        icon_thread.daemon = True
        icon_thread.start()

        # 打开浏览器
        url = f'http://localhost:{port}'
        webbrowser.open(url)

        # 保持主线程运行
        icon_thread.join()

    except Exception as e:
        logger.error(f"程序启动失败: {e}")
        os._exit(1)

if __name__ == '__main__':
    main()
