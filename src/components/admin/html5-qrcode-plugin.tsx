"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Loader2 } from "lucide-react";

interface Html5QrcodePluginProps {
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
  qrCodeSuccessCallback: (decodedText: string) => void;
  qrCodeErrorCallback?: (error: string) => void;
}

// 支持的条码/二维码格式
const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.PDF_417,
  Html5QrcodeSupportedFormats.AZTEC,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.CODABAR,
];

export default function Html5QrcodePlugin({
  fps = 10,
  qrbox = { width: 300, height: 150 }, // 矩形扫描区域，更适合条形码
  aspectRatio = 1.777778, // 16:9
  disableFlip = false,
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
}: Html5QrcodePluginProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>("html5qr-code-reader");
  const isRunning = useRef(false);
  const lastScanTime = useRef(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 创建唯一ID避免多实例冲突
    containerRef.current = `html5qr-code-reader-${Date.now()}`;
    
    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        const html5QrCode = new Html5Qrcode(containerRef.current, {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false,
        });
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps,
            qrbox,
            aspectRatio,
            disableFlip,
          },
          (decodedText: string) => {
            // 防抖：避免短时间内重复扫描同一个码
            const now = Date.now();
            if (now - lastScanTime.current > 1500) {
              lastScanTime.current = now;
              qrCodeSuccessCallback(decodedText);
            }
          },
          (errorMessage: string) => {
            if (qrCodeErrorCallback) {
              qrCodeErrorCallback(errorMessage);
            }
          }
        );
        isRunning.current = true;
        setIsInitializing(false);
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setError("无法启动摄像头，请检查权限设置");
        setIsInitializing(false);
      }
    };

    // 延迟启动确保DOM已挂载
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && isRunning.current) {
        isRunning.current = false;
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(console.error);
      }
    };
  }, [fps, qrbox, aspectRatio, disableFlip, qrCodeSuccessCallback, qrCodeErrorCallback]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {isInitializing && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">正在启动摄像头...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <p className="text-xs mt-2">请确保已授权摄像头访问权限</p>
        </div>
      )}
      <div id={containerRef.current} className="rounded-lg overflow-hidden" />
      {!isInitializing && !error && (
        <div className="text-center mt-3 space-y-1">
          <p className="text-sm font-medium">将二维码或条形码对准扫描框</p>
          <p className="text-xs text-muted-foreground">
            支持: QR码, Code128, Code39, EAN, UPC, DataMatrix 等
          </p>
        </div>
      )}
    </div>
  );
}
