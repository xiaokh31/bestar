/**
 * 扫码对账系统 API
 * 提供容器管理和扫码记录的CRUD操作
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessModule, UserRole } from "@/lib/permissions";

// 验证用户是否有权限访问扫码对账模块
async function checkPermission() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 };
  }
  
  const userRole = (session.user.role || 'CUSTOMER') as UserRole;
  if (!canAccessModule(userRole, 'skuScan')) {
    return { error: "Forbidden", status: 403 };
  }
  
  return { session, userRole };
}

// GET - 获取容器列表或扫码记录
export async function GET(request: NextRequest) {
  const auth = await checkPermission();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'containers' or 'scans'
  const containerId = searchParams.get('containerId');
  const containerNo = searchParams.get('containerNo');
  const status = searchParams.get('status');

  try {
    // 获取扫码记录（通过容器ID或容器编号）
    if (type === 'scans') {
      let targetContainerId: string | null = containerId;
      
      // 如果提供的是containerNo，先查找对应的容器
      if (!targetContainerId && containerNo) {
        const container = await prisma.scanContainer.findUnique({
          where: { containerNo }
        });
        targetContainerId = container?.id ?? null;
      }
      
      if (!targetContainerId) {
        return NextResponse.json({ data: [] });
      }

      const scans = await prisma.skuScan.findMany({
        where: { containerId: targetContainerId },
        orderBy: { createdAt: 'asc' },
        include: {
          container: {
            select: { containerNo: true }
          }
        }
      });

      return NextResponse.json({ 
        data: scans.map(scan => ({
          id: scan.id,
          sku: scan.sku,
          raw_code: scan.rawCode,
          qty: scan.qty,
          pallet_no: scan.palletNo,
          box_no: scan.boxNo,
          operator: scan.operator,
          createdAt: scan.createdAt,
          containerNo: scan.container.containerNo
        }))
      });
    }

    // 获取容器列表
    const whereClause: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (containerNo) {
      whereClause.containerNo = { contains: containerNo, mode: 'insensitive' };
    }

    const containers = await prisma.scanContainer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { scans: true }
        }
      }
    });

    return NextResponse.json({ 
      data: containers.map(c => ({
        ...c,
        scanCount: c._count.scans
      }))
    });

  } catch (error) {
    console.error("Error fetching sku-scan data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// POST - 创建容器或扫码记录
export async function POST(request: NextRequest) {
  const auth = await checkPermission();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { type } = body;

    // 创建新容器
    if (type === 'container') {
      const { containerNo, description } = body;
      
      if (!containerNo) {
        return NextResponse.json(
          { error: "Container number is required" },
          { status: 400 }
        );
      }

      // 检查是否已存在
      const existing = await prisma.scanContainer.findUnique({
        where: { containerNo }
      });
      
      if (existing) {
        return NextResponse.json(
          { error: "Container number already exists" },
          { status: 409 }
        );
      }

      const container = await prisma.scanContainer.create({
        data: {
          containerNo,
          description: description || null,
          createdBy: auth.session.user.email!,
        }
      });

      return NextResponse.json({ data: container }, { status: 201 });
    }

    // 创建扫码记录
    if (type === 'scan') {
      const { container_no, sku, raw_code, qty, pallet_no, box_no, operator } = body;

      if (!container_no || !sku) {
        return NextResponse.json(
          { error: "Container number and SKU are required" },
          { status: 400 }
        );
      }

      // 查找或创建容器
      let container = await prisma.scanContainer.findUnique({
        where: { containerNo: container_no }
      });

      if (!container) {
        container = await prisma.scanContainer.create({
          data: {
            containerNo: container_no,
            createdBy: operator || auth.session.user.email!,
          }
        });
      }

      const scan = await prisma.skuScan.create({
        data: {
          containerId: container.id,
          sku,
          rawCode: raw_code || sku,
          qty: qty || 1,
          palletNo: pallet_no || null,
          boxNo: box_no || null,
          operator: operator || auth.session.user.name || auth.session.user.email!,
        }
      });

      return NextResponse.json({ 
        data: {
          id: scan.id,
          sku: scan.sku,
          raw_code: scan.rawCode,
          qty: scan.qty,
          pallet_no: scan.palletNo,
          box_no: scan.boxNo,
          operator: scan.operator,
          createdAt: scan.createdAt,
          containerNo: container.containerNo
        }
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Invalid type" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error creating sku-scan data:", error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}

// PUT - 更新容器状态
export async function PUT(request: NextRequest) {
  const auth = await checkPermission();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, status, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Container ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;

    const container = await prisma.scanContainer.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ data: container });

  } catch (error) {
    console.error("Error updating container:", error);
    return NextResponse.json(
      { error: "Failed to update container" },
      { status: 500 }
    );
  }
}

// DELETE - 删除容器或扫码记录
export async function DELETE(request: NextRequest) {
  const auth = await checkPermission();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: "ID is required" },
      { status: 400 }
    );
  }

  try {
    if (type === 'scan') {
      await prisma.skuScan.delete({
        where: { id }
      });
    } else {
      // 删除容器会级联删除所有扫码记录
      await prisma.scanContainer.delete({
        where: { id }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
