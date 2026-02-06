"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Loader2, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  qrbox = { width: 300, height: 150 },
  aspectRatio = 1.777778,
  disableFlip = false,
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
}: Html5QrcodePluginProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>(`html5qr-code-reader-${Date.now()}`);
  const isRunning = useRef(false);
  const lastScanTime = useRef(0);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'running' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 检查摄像头权限状态
  const checkCameraPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      // 检查浏览器是否支持Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return result.state;
      }
      // 如果不支持Permissions API，返回prompt让用户尝试
      return 'prompt';
    } catch {
      return 'prompt';
    }
  };

  // 启动扫描器
  const startScanner = useCallback(async () => {
    try {
      setStatus('requesting');
      setErrorMessage(null);

      // 先检查权限状态
      const permission = await checkCameraPermission();
      
      if (permission === 'denied') {
        setStatus('error');
        setErrorMessage('摄像头权限被拒绝。请在浏览器设置中允许摄像头访问，然后点击“重试”按钮。');
        return;
      }

      // 申请摄像头权限
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        // 立即停止，让html5-qrcode来管理
        stream.getTracks().forEach(track => track.stop());
      } catch (mediaError: unknown) {
        const err = mediaError as Error;
        console.error('Camera permission error:', err);
        setStatus('error');
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('摄像头权限被拒绝。请在浏览器地址栏旁点击摄像头图标允许访问。');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMessage('未检测到摄像头设备。');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setErrorMessage('摄像头被其他应用占用，请关闭其他使用摄像头的应用。');
        } else {
          setErrorMessage(`无法访问摄像头: ${err.message}`);
        }
        return;
      }

      // 确保DOM元素存在
      const element = document.getElementById(containerRef.current);
      if (!element) {
        setStatus('error');
        setErrorMessage('扫描器容器未找到');
        return;
      }

      // 初始化扫描器
      const html5QrCode = new Html5Qrcode(containerRef.current, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps, qrbox, aspectRatio, disableFlip },
        (decodedText: string) => {
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
      setStatus('running');
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setStatus('error');
      setErrorMessage('启动扫描器失败，请刷新页面重试');
    }
  }, [fps, qrbox, aspectRatio, disableFlip, qrCodeSuccessCallback, qrCodeErrorCallback]);

  // 停止扫描器
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunning.current) {
      isRunning.current = false;
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
  }, []);

  // 组件加载时自动启动
  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  // 重试按钮
  const handleRetry = () => {
    stopScanner().then(() => {
      startScanner();
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {status === 'requesting' && (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
          <p className="text-sm font-medium">正在请求摄像头权限...</p>
          <p className="text-xs text-muted-foreground mt-1">请在弹出的权限请求中点击“允许”</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-center py-8 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <Camera className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">摄像头访问失败</p>
          <p className="text-sm text-red-500 dark:text-red-400 mb-4 px-4">{errorMessage}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
          <p className="text-xs text-muted-foreground mt-4 px-4">
            提示：在浏览器地址栏左侧点击“网站信息”图标 &gt; 摄像头 &gt; 允许
          </p>
        </div>
      )}
      
      <div 
        id={containerRef.current} 
        className={`rounded-lg overflow-hidden ${status !== 'running' ? 'hidden' : ''}`} 
      />
      
      {status === 'running' && (
        <div className="text-center mt-3 space-y-1">
          <p className="text-sm font-medium text-green-600">✅ 摄像头已开启，请将码对准扫描框</p>
          <p className="text-xs text-muted-foreground">
            支持: QR码, Code128, Code39, EAN, UPC, DataMatrix 等
          </p>
        </div>
      )}
    </div>
  );
}
