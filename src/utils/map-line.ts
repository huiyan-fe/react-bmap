/* Road drawing utilities for map canvas layer */

const roadColor: Record<number, string> = {
  0: '#fff',
  1: '#00dc35',
  2: '#f3e032',
  3: '#ff6c6c',
  4: '#900000',
};

const B = typeof window !== 'undefined' ? ((window as any).BMap || (window as any).BMapGL) : null;

export const drawRoads = (map: any, ctx: CanvasRenderingContext2D, roads: string[], options: any = {}) => {
  if (!B) return [];
  const zoom = map.getZoom();
  const lineWidth = options.lineWidth || 5;
  const level = options.level === undefined ? 1 : options.level;
  let pointTem: { x: number; y: number } | null = null;
  let dep = 0;
  let lineTotalDepth = 0;
  const points: any[] = [];
  const allPoints: any[] = [];
  let arrowPoint: any[] = [];
  let arrpwTotalDepth = 0;
  let totalDepth = 0;

  const zoomUnit = Math.pow(2, 18 - map.getZoom());
  const projection = map.getMapType().getProjection();
  const mcCenter = projection.lngLatToPoint(map.getCenter());
  const nwMc = new B.Pixel(
    mcCenter.x - (map.getSize().width / 2) * zoomUnit,
    mcCenter.y + (map.getSize().height / 2) * zoomUnit
  );

  roads.forEach((item, index) => {
    let startPos: any = null;
    pointTem = null;
    const path = item.split(',');
    for (let k = 0; k < path.length; k += 2) {
      const point = new B.Point(parseFloat(path[k]), parseFloat(path[k + 1]));
      allPoints.push(point);
      let pixel: { x: number; y: number };
      if (options.coordType === 'bd09mc') {
        pixel = {
          x: (point.lng - nwMc.x) / zoomUnit,
          y: (nwMc.y - point.lat) / zoomUnit,
        };
      } else {
        const p = map.pointToPixel(point);
        pixel = { x: p.x, y: p.y };
      }
      if (pointTem) {
        const deltaX = pixel.x - pointTem.x;
        const deltaY = pixel.y - pointTem.y;
        dep = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        lineTotalDepth += dep;
        if (options.arrow) {
          arrpwTotalDepth += dep;
          totalDepth += dep;
          const arrowInfo = {
            start: pointTem,
            end: pixel,
            offset: 50 - (arrpwTotalDepth - dep),
            depth: dep,
            totalDepth,
          };
          points.push(arrowInfo);
          if (arrpwTotalDepth >= 50) {
            arrowPoint.push(arrowInfo);
            arrpwTotalDepth %= 50;
          }
        }
      }
      pointTem = pixel;
      if (k === 0) {
        startPos = pixel;
        ctx.moveTo(pixel.x, pixel.y);
      } else if (lineTotalDepth > 15 || k >= path.length - 2) {
        lineTotalDepth = 0;
        ctx.lineTo(pixel.x, pixel.y);
      }
    }
    if (options.arrow && totalDepth < 100 && index === roads.length - 1) {
      let center = points[Math.ceil(points.length / 2)];
      for (let i = 0; i < points.length; i++) {
        if (points[i].totalDepth >= totalDepth / 2) {
          center = points[i + 1] || points[i];
          break;
        }
      }
      const end = points[points.length - 1];
      center.end = end.end;
      arrowPoint = [center];
    }
  });

  if (options.line) {
    ctx.lineCap = options.lineCap || 'round';
    ctx.lineJoin = 'round';
    if (options.border) {
      ctx.strokeStyle = options.border.color || 'white';
      ctx.lineWidth = (zoom <= 13 ? lineWidth - 2 : lineWidth) + ((options.border.lineWidth || 2) * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = options.color || roadColor[level] || '#fc2c2b';
    ctx.lineWidth = zoom <= 13 ? lineWidth - 2 : lineWidth;
    ctx.stroke();
  }

  if (options.arrow) {
    drawArrow(ctx, arrowPoint, options);
  }
  return allPoints;
};

function drawArrow(ctx: CanvasRenderingContext2D, arrowPoint: any[], options: any) {
  ctx.beginPath();
  arrowPoint.forEach((item) => {
    const startX = item.start.x;
    const startY = item.start.y;
    const endX = item.end.x;
    const endY = item.end.y;
    const depthX = endX - startX;
    const depthY = endY - startY;
    const vOrigin = [0, -1];
    const vItem = [endX - startX, endY - startY];
    const angleVar1 = vOrigin[0] * vItem[0] + vOrigin[1] * vItem[1];
    const angleVar2 = Math.sqrt(vOrigin[0] ** 2 + vOrigin[1] ** 2);
    const angleVar3 = Math.sqrt(vItem[0] ** 2 + vItem[1] ** 2);
    let angle = Math.acos(angleVar1 / (angleVar2 * angleVar3));
    if (vItem[0] < 0) angle = Math.PI * 2 - angle;
    const width = (options.arrow?.width || 4) / 2;
    const height = options.arrow?.height || width;
    let loop = 0;
    while (item.offset + 50 * loop <= item.depth) {
      const offset = item.offset + 50 * loop;
      const offsetPresent = offset / item.depth;
      ctx.save();
      ctx.translate(startX + depthX * offsetPresent, startY + depthY * offsetPresent);
      ctx.rotate(angle);
      ctx.moveTo(-width * 1.618, height);
      ctx.lineTo(0, 0);
      ctx.lineTo(width * 1.618, height);
      ctx.restore();
      loop += 1;
    }
  });
  ctx.strokeStyle = options.arrow?.color || '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
}

export default { drawRoads };
