"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "@/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Upload, 
  Download, 
  Camera, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Archive,
  Loader2,
  RefreshCw,
  Smartphone,
  X,
  Save
} from "lucide-react";
import * as XLSX from "xlsx";
import dynamic from "next/dynamic";

// 动态导入手机扫码组件（避免SSR问题）
const Html5QrcodePlugin = dynamic(() => import("@/components/admin/html5-qrcode-plugin"), {
  ssr: false,
  loading: () => <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

interface ScanContainer {
  id: string;
  containerNo: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdBy: string;
  createdAt: string;
  scanCount: number;
}

interface ScanRecord {
  id: string;
  sku: string;
  raw_code: string;
  qty: number;
  pallet_no: string | null;
  box_no: string | null;
  operator: string;
  createdAt: string;
}

interface ExcelRow {
  [key: string]: string | number | boolean | null | undefined;
  _skuValue?: string;
  _originalQty?: number;
  _isHighlighted?: boolean;
  scannedSkuDisplay?: string;
  scannedQtyDisplay?: number;
  palletDisplay?: string;
  boxDisplay?: string;
  operatorDisplay?: string;
}

export default function SkuScanPage() {
  const { t } = useLocale();
  const { data: session } = useSession();
  const skuScan = t.admin?.skuScan || {};
  
  // 容器管理状态
  const [containers, setContainers] = useState<ScanContainer[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<ScanContainer | null>(null);
  const [newContainerNo, setNewContainerNo] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // 扫码状态
  const [scanMode, setScanMode] = useState<"box" | "locate">("box");
  const [operator, setOperator] = useState("");
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lastScannedInfo, setLastScannedInfo] = useState("...");
  
  // Excel数据
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<ExcelRow[]>([]);
  const [skuColumnKey, setSkuColumnKey] = useState("");
  const [qtyColumnKey, setQtyColumnKey] = useState("");
  
  // 扫码枪缓冲
  const gunBuffer = useRef("");
  const lastGunTime = useRef(0);
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 手机扫码状态
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  
  // 自动刷新（多人协作）
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 自动保存状态
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // localStorage键名
  const getStorageKey = (containerId: string) => `sku-scan-data-${containerId}`;

  // 保存数据到localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!selectedContainer || !tableData.length) return;
    
    const dataToSave = {
      originalHeaders,
      tableData,
      skuColumnKey,
      qtyColumnKey,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(getStorageKey(selectedContainer.id), JSON.stringify(dataToSave));
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [selectedContainer, tableData, originalHeaders, skuColumnKey, qtyColumnKey]);

  // 从localStorage恢复数据
  const loadFromLocalStorage = useCallback((containerId: string) => {
    try {
      const saved = localStorage.getItem(getStorageKey(containerId));
      if (saved) {
        const data = JSON.parse(saved);
        if (data.tableData && data.tableData.length > 0) {
          setOriginalHeaders(data.originalHeaders || []);
          setTableData(data.tableData);
          setSkuColumnKey(data.skuColumnKey || '');
          setQtyColumnKey(data.qtyColumnKey || '');
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return false;
  }, []);

  // 清除localStorage数据
  const clearLocalStorage = useCallback(() => {
    if (!selectedContainer) return;
    localStorage.removeItem(getStorageKey(selectedContainer.id));
    setLastSaved(null);
  }, [selectedContainer]);

  // 自动保存：表格数据变化时自动保存
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    if (selectedContainer && tableData.length > 0) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveToLocalStorage();
      }, 2000); // 2秒后自动保存
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [tableData, selectedContainer, saveToLocalStorage]);

  // 获取容器列表
  const fetchContainers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      
      const res = await fetch(`/api/admin/sku-scan?${params}`);
      const data = await res.json();
      if (data.data) setContainers(data.data);
    } catch (error) {
      console.error("Failed to fetch containers:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // 获取扫码记录
  const fetchScans = useCallback(async (containerId: string) => {
    try {
      const res = await fetch(`/api/admin/sku-scan?type=scans&containerId=${containerId}`);
      const data = await res.json();
      if (data.data) {
        setScans(data.data);
        recalcTable(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch scans:", error);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  useEffect(() => {
    if (selectedContainer) {
      // 尝试从localStorage恢复数据
      const restored = loadFromLocalStorage(selectedContainer.id);
      if (restored) {
        setLastSaved(skuScan.restored || '已恢复');
      }
      fetchScans(selectedContainer.id);
    } else {
      // 清空状态
      setTableData([]);
      setOriginalHeaders([]);
      setLastSaved(null);
    }
  }, [selectedContainer, fetchScans, loadFromLocalStorage]);

  // 多人协作：定时刷新扫码记录
  useEffect(() => {
    if (autoRefresh && selectedContainer) {
      refreshIntervalRef.current = setInterval(() => {
        fetchScans(selectedContainer.id);
      }, 3000); // 每3秒刷新一次
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, selectedContainer, fetchScans]);

  // 设置默认操作人
  useEffect(() => {
    if (session?.user?.name && !operator) {
      setOperator(session.user.name);
    }
  }, [session, operator]);

  // 全局扫码枪监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入框内，则不拦截
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!selectedContainer) return;

      const currTime = Date.now();
      // 如果两次按键间隔超过100ms，视为新输入
      if (currTime - lastGunTime.current > 100) {
        gunBuffer.current = "";
      }
      lastGunTime.current = currTime;

      if (e.key === "Enter") {
        if (gunBuffer.current.length > 0) {
          processInput(gunBuffer.current);
          gunBuffer.current = "";
        }
      } else if (e.key.length === 1) {
        gunBuffer.current += e.key;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedContainer, tableData, operator, scanMode]);

  // 处理扫码输入
  const processInput = async (code: string) => {
    if (!selectedContainer) return;
    if (!tableData.length) {
      alert(skuScan.pleaseImportExcel || "请先导入Excel");
      return;
    }

    code = code.trim();
    // 模糊匹配SKU
    const row = tableData.find(r => 
      r._skuValue && (code.includes(r._skuValue) || r._skuValue.includes(code))
    );

    if (row) {
      setLastScannedInfo(row._skuValue || "");
      highlightRow(row);
      playBeep("success");

      if (scanMode === "box") {
        try {
          setSaving(true);
          const res = await fetch("/api/admin/sku-scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "scan",
              container_no: selectedContainer.containerNo,
              sku: row._skuValue,
              raw_code: code,
              qty: 1,
              operator: operator
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            setScans(prev => [...prev, data.data]);
            recalcTable([...scans, data.data]);
          }
        } catch (error) {
          alert(skuScan.saveFailed || "保存失败");
        } finally {
          setSaving(false);
        }
      } else {
        setLastScannedInfo(`${row._skuValue} (${skuScan.locateSuccess || "定位成功"})`);
      }
    } else {
      setLastScannedInfo(`${skuScan.unknownSku || "未知SKU"}: ${code}`);
      playBeep("error");
    }
  };

  // 手机摄像头扫码回调
  const onCameraScanSuccess = (decodedText: string) => {
    processInput(decodedText);
  };

  // 手动修改扫码记录的Qty/Pallet/Box
  const updateRowField = (rowIdx: number, field: 'scannedQtyDisplay' | 'palletDisplay' | 'boxDisplay', value: string | number) => {
    setTableData(prev => prev.map((row, idx) => {
      if (idx === rowIdx) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  // 重新计算表格显示
  const recalcTable = (currentScans: ScanRecord[]) => {
    if (!tableData.length) return;
    
    const newData = tableData.map(row => ({
      ...row,
      scannedQtyDisplay: 0,
      scannedSkuDisplay: "",
      palletDisplay: "",
      boxDisplay: "",
      operatorDisplay: ""
    }));

    currentScans.forEach(scan => {
      const row = newData.find(r => r._skuValue === scan.sku);
      if (row) {
        row.scannedSkuDisplay = scan.sku;
        row.scannedQtyDisplay = (row.scannedQtyDisplay || 0) + (scan.qty || 1);
        if (scan.pallet_no) row.palletDisplay = scan.pallet_no;
        if (scan.box_no) row.boxDisplay = scan.box_no;
        row.operatorDisplay = scan.operator;
      }
    });

    setTableData(newData);
  };

  // 高亮行
  const highlightRow = (row: ExcelRow) => {
    setTableData(prev => prev.map(r => ({
      ...r,
      _isHighlighted: r === row
    })));
    
    const idx = tableData.indexOf(row);
    const el = document.getElementById(`row-${idx}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // 播放提示音
  const playBeep = (type: "success" | "error") => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      if (type === "success") {
        osc.frequency.value = 800;
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        osc.frequency.value = 200;
        osc.type = "sawtooth";
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio not supported
    }
  };

  // 处理Excel上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(new Uint8Array(evt.target?.result as ArrayBuffer), { type: "array" });
      const json = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      
      if (json.length > 0) {
        const headers = json[0].map((h: string | number) => String(h));
        setOriginalHeaders(headers);
        
        // 识别SKU和Qty列
        const skuCol = headers.find((h: string) => /sku/i.test(h)) || headers[0];
        const qtyCol = headers.find((h: string) => /qty|quantity|数量/i.test(h));
        setSkuColumnKey(skuCol);
        setQtyColumnKey(qtyCol || "");

        const data: ExcelRow[] = json.slice(1).map((rowArr: (string | number)[]) => {
          const obj: ExcelRow = {
            _isHighlighted: false,
            scannedSkuDisplay: "",
            scannedQtyDisplay: 0,
            palletDisplay: "",
            boxDisplay: "",
            operatorDisplay: ""
          };
          headers.forEach((h, i) => obj[h] = rowArr[i]);
          obj._skuValue = String(obj[skuCol] || "").trim();
          obj._originalQty = qtyCol ? (parseInt(String(obj[qtyCol])) || 0) : 0;
          return obj;
        });

        setTableData(data);
        if (scans.length) recalcTable(scans);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // 导出结果
  const exportExcel = () => {
    const data = tableData.map(row => {
      const obj: Record<string, unknown> = {};
      originalHeaders.forEach(h => obj[h] = row[h]);
      obj["Scanned SKU"] = row.scannedSkuDisplay;
      obj["Scanned Qty"] = row.scannedQtyDisplay;
      obj["Pallet No."] = row.palletDisplay;
      obj["Box No."] = row.boxDisplay;
      obj["Operator"] = row.operatorDisplay;
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Result");
    XLSX.writeFile(wb, `${selectedContainer?.containerNo || "scan"}_Result.xlsx`);
  };

  // 导出差异
  const exportDiffExcel = () => {
    const diffRows = tableData.filter(row => 
      row.scannedQtyDisplay !== row._originalQty
    );
    if (diffRows.length === 0) {
      alert(skuScan.noDifference || "无差异！");
      return;
    }
    const data = diffRows.map(row => ({
      "SKU": row._skuValue,
      "Original Qty": row._originalQty,
      "Scanned Qty": row.scannedQtyDisplay,
      "Difference": (row.scannedQtyDisplay || 0) - (row._originalQty || 0),
      "Operator": row.operatorDisplay
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DiffReport");
    XLSX.writeFile(wb, `${selectedContainer?.containerNo || "scan"}_DiffReport.xlsx`);
  };

  // 创建容器
  const createContainer = async () => {
    if (!newContainerNo.trim()) return;
    
    try {
      setSaving(true);
      const res = await fetch("/api/admin/sku-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "container",
          containerNo: newContainerNo.trim(),
          description: newDescription.trim() || null
        })
      });
      
      if (res.ok) {
        setNewContainerNo("");
        setNewDescription("");
        setIsCreateDialogOpen(false);
        fetchContainers();
      } else {
        const data = await res.json();
        alert(data.error || skuScan.createFailed || "创建失败");
      }
    } catch (error) {
      console.error("Failed to create container:", error);
    } finally {
      setSaving(false);
    }
  };

  // 更新容器状态
  const updateContainerStatus = async (container: ScanContainer, status: "ACTIVE" | "COMPLETED" | "ARCHIVED") => {
    try {
      await fetch("/api/admin/sku-scan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: container.id, status })
      });
      fetchContainers();
    } catch (error) {
      console.error("Failed to update container:", error);
    }
  };

  // 删除容器
  const deleteContainer = async (container: ScanContainer) => {
    if (!confirm(skuScan.confirmDelete || "确定删除该柜号及所有扫码记录？")) return;
    
    try {
      await fetch(`/api/admin/sku-scan?type=container&id=${container.id}`, {
        method: "DELETE"
      });
      if (selectedContainer?.id === container.id) {
        setSelectedContainer(null);
        setScans([]);
      }
      fetchContainers();
    } catch (error) {
      console.error("Failed to delete container:", error);
    }
  };

  // 状态徽章
  const statusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">{skuScan.statusActive || "进行中"}</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500">{skuScan.statusCompleted || "已完成"}</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">{skuScan.statusArchived || "已归档"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{skuScan.title || "扫码对账"}</h1>
          <p className="text-muted-foreground">{skuScan.description || "导入清单，扫码核对数量"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧：容器列表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{skuScan.containers || "柜号列表"}</CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    {skuScan.new || "新建"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{skuScan.newContainer || "新建柜号"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium">{skuScan.containerNo || "柜号"} *</label>
                      <Input 
                        value={newContainerNo}
                        onChange={(e) => setNewContainerNo(e.target.value)}
                        placeholder="CONTAINER-001"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{skuScan.descriptionLabel || "描述"}</label>
                      <Input 
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder={skuScan.optional || "可选"}
                      />
                    </div>
                    <Button onClick={createContainer} className="w-full" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {skuScan.create || "创建"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mb-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{skuScan.all || "全部"}</SelectItem>
                <SelectItem value="ACTIVE">{skuScan.statusActive || "进行中"}</SelectItem>
                <SelectItem value="COMPLETED">{skuScan.statusCompleted || "已完成"}</SelectItem>
                <SelectItem value="ARCHIVED">{skuScan.statusArchived || "已归档"}</SelectItem>
              </SelectContent>
            </Select>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {containers.map((container) => (
                  <div
                    key={container.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedContainer?.id === container.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedContainer(container)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{container.containerNo}</div>
                        <div className={`text-xs ${selectedContainer?.id === container.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {container.scanCount} {skuScan.records || "条记录"}
                        </div>
                      </div>
                      {statusBadge(container.status)}
                    </div>
                  </div>
                ))}
                {containers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {skuScan.noContainers || "暂无柜号"}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：扫码操作区 */}
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            {selectedContainer ? (
              <div className="space-y-4">
                {/* 操作栏 - 优化响应式布局 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pb-4 border-b">
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground font-medium block truncate">
                      1. {skuScan.containerNo || "柜号"}
                    </label>
                    <Input 
                      value={selectedContainer.containerNo} 
                      readOnly 
                      className="font-bold text-blue-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground font-medium block truncate">
                      2. {skuScan.operator || "操作人"}
                    </label>
                    <Input 
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="bg-yellow-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground font-medium block truncate">
                      3. {skuScan.scanMode || "模式"}
                    </label>
                    <Select value={scanMode} onValueChange={(v) => setScanMode(v as "box" | "locate")}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="box">📦 {skuScan.modeBox || "整箱"}</SelectItem>
                        <SelectItem value="locate">🔍 {skuScan.modeLocate || "定位"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                    <label className="text-xs text-muted-foreground font-medium block truncate">
                      4. {skuScan.importExcel || "导入"}
                    </label>
                    <Input 
                      type="file" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-3 lg:col-span-2 flex gap-1 items-end">
                    {/* 手机扫码按钮 - 更明显的样式 */}
                    <Button 
                      onClick={() => setShowCameraScanner(!showCameraScanner)} 
                      size="sm" 
                      variant={showCameraScanner ? "default" : "secondary"}
                      className={`flex-1 ${showCameraScanner ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      <span>{showCameraScanner ? (skuScan.closeScanner || "关闭扫码") : (skuScan.cameraScan || "手机扫码")}</span>
                    </Button>
                    <Button onClick={exportExcel} size="sm" variant="outline" className="flex-1" disabled={!tableData.length}>
                      <Download className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">{skuScan.export || "导出"}</span>
                    </Button>
                    <Button onClick={exportDiffExcel} size="sm" variant="destructive" className="flex-none" disabled={!tableData.length}>
                      <span>{skuScan.exportDiff || "差异"}</span>
                    </Button>
                  </div>
                </div>

                {/* 手机扫码区域 */}
                {showCameraScanner && (
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        {skuScan.cameraScan || "手机/摄像头扫码"}
                      </h3>
                      <Button size="sm" variant="ghost" onClick={() => setShowCameraScanner(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Html5QrcodePlugin
                      fps={10}
                      qrbox={{ width: 300, height: 150 }}
                      qrCodeSuccessCallback={onCameraScanSuccess}
                    />
                  </div>
                )}

                {/* 状态栏 */}
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex flex-col md:flex-row justify-between items-center gap-2">
                  <div className="text-sm flex-1">
                    <span className="font-bold">{skuScan.lastScan || "最近扫描"}: </span>
                    <span className="font-bold text-red-600 text-lg">{lastScannedInfo}</span>
                    {saving && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
                    {lastSaved && (
                      <span className="ml-3 text-xs text-green-600 inline-flex items-center gap-1">
                        <Save className="h-3 w-3" />
                        {skuScan.autoSaved || "已自动保存"}: {lastSaved}
                      </span>
                    )}
                    {autoRefresh && (
                      <span className="ml-2 text-xs text-green-600 flex items-center gap-1 inline-flex">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        {skuScan.autoRefresh || "自动刷新"}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={autoRefresh ? "default" : "outline"}
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className="text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                      {skuScan.sync || "同步"}
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedContainer.status === "ACTIVE" ? "default" : "outline"}
                      onClick={() => updateContainerStatus(selectedContainer, "ACTIVE")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {skuScan.statusActive || "进行中"}
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedContainer.status === "COMPLETED" ? "default" : "outline"}
                      onClick={() => updateContainerStatus(selectedContainer, "COMPLETED")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {skuScan.statusCompleted || "完成"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateContainerStatus(selectedContainer, "ARCHIVED")}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      {skuScan.archive || "归档"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteContainer(selectedContainer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 数据表格 - Qty/Pallet/Box可编辑 */}
                {tableData.length > 0 ? (
                  <div className="border rounded-lg overflow-x-auto max-h-[50vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {originalHeaders.map(h => (
                            <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
                          ))}
                          <TableHead className="bg-blue-100 dark:bg-blue-900 whitespace-nowrap">Scanned SKU</TableHead>
                          <TableHead className="bg-blue-100 dark:bg-blue-900 whitespace-nowrap w-20">Qty</TableHead>
                          <TableHead className="bg-blue-100 dark:bg-blue-900 whitespace-nowrap">Pallet</TableHead>
                          <TableHead className="bg-blue-100 dark:bg-blue-900 whitespace-nowrap">Box</TableHead>
                          <TableHead className="bg-blue-100 dark:bg-blue-900 whitespace-nowrap">Operator</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((row, idx) => (
                          <TableRow 
                            key={idx} 
                            id={`row-${idx}`}
                            className={row._isHighlighted ? "bg-green-100 dark:bg-green-900" : ""}
                          >
                            {originalHeaders.map(h => (
                              <TableCell key={h} className="whitespace-nowrap">{String(row[h] ?? "")}</TableCell>
                            ))}
                            <TableCell className="font-bold text-blue-700 dark:text-blue-300">{row.scannedSkuDisplay}</TableCell>
                            <TableCell className="p-1">
                              <Input
                                type="number"
                                value={row.scannedQtyDisplay || 0}
                                onChange={(e) => updateRowField(idx, 'scannedQtyDisplay', parseInt(e.target.value) || 0)}
                                className="w-16 text-center font-bold text-blue-700 dark:text-blue-300 h-8"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <Input
                                value={row.palletDisplay || ""}
                                onChange={(e) => updateRowField(idx, 'palletDisplay', e.target.value)}
                                placeholder="-"
                                className="w-20 h-8 text-xs"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <Input
                                value={row.boxDisplay || ""}
                                onChange={(e) => updateRowField(idx, 'boxDisplay', e.target.value)}
                                placeholder="-"
                                className="w-20 h-8 text-xs"
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{row.operatorDisplay}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="border rounded-lg p-12 text-center text-muted-foreground">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{skuScan.uploadHint || "请上传Excel清单开始扫码对账"}</p>
                    <p className="text-xs mt-2">{skuScan.uploadHint2 || "支持 .xlsx, .xls, .csv 格式"}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{skuScan.selectContainer || "请从左侧选择或创建柜号"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
