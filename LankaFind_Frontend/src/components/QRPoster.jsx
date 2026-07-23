import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Renders a QR code pointing at `url`, inside a simple printable poster layout,
// with a button to download the whole poster as a PNG image.
function QRPoster({ url, title, subtitle, accentColor = '#2563eb' }) {
  const posterRef = useRef(null);

  const handleDownload = () => {
    const canvas = posterRef.current.querySelector('canvas');
    if (!canvas) return;

    // Draw the QR canvas onto a bigger poster canvas with text, then download that
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 500;
    posterCanvas.height = 650;
    const ctx = posterCanvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, posterCanvas.width, posterCanvas.height);

    // Header bar
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, posterCanvas.width, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LankaFind', posterCanvas.width / 2, 57);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px sans-serif';
    wrapText(ctx, title, posterCanvas.width / 2, 140, 440, 30);

    // Subtitle
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px sans-serif';
    ctx.fillText(subtitle, posterCanvas.width / 2, 200);

    // QR code
    ctx.drawImage(canvas, (posterCanvas.width - 260) / 2, 230, 260, 260);

    // Footer instruction
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('📱 Scan to view on LankaFind', posterCanvas.width / 2, 540);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '13px sans-serif';
    ctx.fillText(url, posterCanvas.width / 2, 570);

    const link = document.createElement('a');
    link.download = 'lankafind-poster.png';
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={posterRef}
        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 w-full max-w-xs"
      >
        <p className="font-bold text-lg" style={{ color: accentColor }}>Lanka<span className="text-amber-500">Find</span></p>
        <p className="text-sm font-semibold text-gray-800 text-center">{title}</p>
        <p className="text-xs text-gray-500 text-center">{subtitle}</p>
        <QRCodeCanvas value={url} size={180} fgColor="#1f2937" />
        <p className="text-xs text-gray-400 text-center break-all">{url}</p>
      </div>

      <button
        onClick={handleDownload}
        className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
      >
        ⬇️ Download Poster (PNG)
      </button>
    </div>
  );
}

// Small helper to wrap long titles onto multiple centered lines on the canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  words.forEach((word) => {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, x, currentY);
}

export default QRPoster;
