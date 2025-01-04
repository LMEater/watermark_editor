document.addEventListener('DOMContentLoaded', function() {
    const imageContainer = document.getElementById('imageContainer');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const dropText = document.getElementById('dropText');
    let originalImage = null;

    // 监听粘贴事件
    document.addEventListener('paste', function(e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const url = URL.createObjectURL(blob);
                loadImage(url);
                break;
            }
        }
    });

    // 加载图片
    function loadImage(url) {
        originalImage = new Image();
        originalImage.onload = function() {
            dropText.style.display = 'none';
            imageCanvas.style.display = 'block';
            imageCanvas.width = originalImage.width;
            imageCanvas.height = originalImage.height;
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            ctx.drawImage(originalImage, 0, 0);
        };
        originalImage.src = url;
    }

    // 应用水印
    document.getElementById('applyWatermark').addEventListener('click', function() {
        if (!originalImage) {
            showMessage('请先粘贴图片', 'error');
            return;
        }

        const text = document.getElementById('watermarkText').value;
        if (!text) {
            showMessage('请输入水印文字', 'error');
            return;
        }

        // 重新绘制原图
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        ctx.drawImage(originalImage, 0, 0);

        // 获取水印设置
        const fontSize = document.getElementById('fontSize').value;
        const color = document.getElementById('watermarkColor').value;
        const opacity = parseFloat(document.getElementById('opacity').value) / 100;
        const position = document.getElementById('position').value;

        // 设置水印样式
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.textBaseline = 'top';

        // 分割文本为多行
        const lines = text.split('\n');
        const lineHeight = parseInt(fontSize) * 1.2; // 行高为字体大小的1.2倍
        
        // 计算整体文本高度
        const totalHeight = lineHeight * lines.length;
        
        // 计算最长行的宽度
        let maxWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            maxWidth = Math.max(maxWidth, metrics.width);
        });

        // 计算起始位置
        let startX, startY;
        const padding = 20;

        switch(position) {
            case 'center':
                startX = (imageCanvas.width - maxWidth) / 2;
                startY = (imageCanvas.height - totalHeight) / 2;
                break;
            case 'topLeft':
                startX = padding;
                startY = padding;
                break;
            case 'topRight':
                startX = imageCanvas.width - maxWidth - padding;
                startY = padding;
                break;
            case 'bottomLeft':
                startX = padding;
                startY = imageCanvas.height - totalHeight - padding;
                break;
            case 'bottomRight':
                startX = imageCanvas.width - maxWidth - padding;
                startY = imageCanvas.height - totalHeight - padding;
                break;
        }

        // 绘制每一行文字
        lines.forEach((line, index) => {
            const y = startY + (lineHeight * index);
            ctx.fillText(line, startX, y);
        });

        ctx.globalAlpha = 1.0;

        showMessage('水印已应用', 'success');
    });

    // 下载图片
    document.getElementById('downloadBtn').addEventListener('click', function() {
        if (!imageCanvas.toDataURL) {
            showMessage('无法下载图片', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = 'watermarked_image.png';
        link.href = imageCanvas.toDataURL('image/png');
        link.click();
    });

    // 复制图片
    document.getElementById('copyBtn').addEventListener('click', function() {
        if (!imageCanvas.toBlob) {
            showMessage('无法复制图片', 'error');
            return;
        }

        imageCanvas.toBlob(function(blob) {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]).then(function() {
                showMessage('图片已复制到剪贴板', 'success');
            }).catch(function(err) {
                showMessage('复制失败: ' + err, 'error');
            });
        });
    });

    // 显示消息
    function showMessage(text, type) {
        const message = document.getElementById('message');
        message.textContent = text;
        message.className = type;
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }

    // 字体大小显示
    document.getElementById('fontSize').addEventListener('input', function(e) {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
    });

    // 透明度显示
    document.getElementById('opacity').addEventListener('input', function(e) {
        document.getElementById('opacityValue').textContent = e.target.value + '%';
    });

    // 实时预览水印颜色
    document.getElementById('watermarkColor').addEventListener('input', function(e) {
        const colorPreview = document.getElementById('colorPreview');
        colorPreview.style.backgroundColor = e.target.value;
    });
});
