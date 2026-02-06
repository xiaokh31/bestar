"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";
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
  // 使用稳定的ID避免重新渲染问题
  const uniqueId = useId();
  const containerId = `qr-reader-${uniqueId.replace(/:/g, '-')}`;
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunning = useRef(false);
  const isMounted = useRef(true);
  const lastScanTime = useRef(0);
  const hasStarted = useRef(false);
  
  const [status, setStatus] = useState<'idle' | 'requesting' | 'running' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 停止扫描器
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      isRunning.current = false;
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // 忽略停止错误
      }
      scannerRef.current = null;
    }
  }, []);

  // 启动扫描器
  const startScanner = useCallback(async () => {
    // 防止重复启动
    if (hasStarted.current || isRunning.current) return;
    hasStarted.current = true;
    
    if (!isMounted.current) return;
    
    setStatus('requesting');
    setErrorMessage(null);

    // 申请摄像头权限 - 先尝试后置摄像头，失败则使用默认摄像头
    let cameraConstraints: MediaStreamConstraints['video'] = { facingMode: "environment" };
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: cameraConstraints });
      stream.getTracks().forEach(track => track.stop());
    } catch (firstError) {
      // 后置摄像头失败，尝试默认摄像头（适用于 Mac 等桌面设备）
      console.log('Back camera not available, trying default camera...');
      cameraConstraints = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (mediaError: unknown) {
        const err = mediaError as Error;
        console.error('Camera permission error:', err);
        if (!isMounted.current) return;
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
        hasStarted.current = false;
        return;
      }
    }

    if (!isMounted.current) return;

    // 等待DOM元素准备就绪
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const element = document.getElementById(containerId);
    if (!element || !isMounted.current) {
      hasStarted.current = false;
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      // 根据之前的检测结果选择摄像头
      const cameraConfig = cameraConstraints === true 
        ? { facingMode: "user" }  // Mac/桌面使用前置摄像头
        : { facingMode: "environment" };  // 移动设备使用后置摄像头

      await html5QrCode.start(
        cameraConfig,
        { fps, qrbox, aspectRatio, disableFlip },
        (decodedText: string) => {
          const now = Date.now();
          if (now - lastScanTime.current > 1500) {
            lastScanTime.current = now;
            qrCodeSuccessCallback(decodedText);
          }
        },
        (errorMsg: string) => {
          if (qrCodeErrorCallback) {
            qrCodeErrorCallback(errorMsg);
          }
        }
      );
      
      if (!isMounted.current) {
        await stopScanner();
        return;
      }
      
      isRunning.current = true;
      setStatus('running');
    } catch (err) {
      console.error("Failed to start scanner:", err);
      if (!isMounted.current) return;
      setStatus('error');
      setErrorMessage('启动扫描器失败，请刷新页面重试');
      hasStarted.current = false;
    }
  }, [containerId, fps, qrbox, aspectRatio, disableFlip, qrCodeSuccessCallback, qrCodeErrorCallback, stopScanner]);

  // 组件加载/卸载管理
  useEffect(() => {
    isMounted.current = true;
    hasStarted.current = false;
    
    const timer = setTimeout(() => {
      if (isMounted.current) {
        startScanner();
      }
    }, 500);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      // 确保离开页面时关闭摄像头
      stopScanner();
    };
  }, []); // 空依赖数组，只在挂载/卸载时执行

  // 重试按钮
  const handleRetry = useCallback(() => {
    hasStarted.current = false;
    stopScanner().then(() => {
      startScanner();
    });
  }, [stopScanner, startScanner]);

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
      
      {/* 扫描器容器 - 始终渲染但根据状态隐藏 */}
      <div 
        id={containerId} 
        className={`rounded-lg overflow-hidden bg-black ${status === 'running' ? '' : 'hidden'}`}
        style={{ minHeight: status === 'running' ? '200px' : '0' }}
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
