"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { drag } from "d3-drag";
import { zoom } from "d3-zoom";
import { Post } from "@/types";
import { formatDate } from "@/src/core/utils/utils";

interface KnowledgeGraphProps {
  posts: Post[];
}

interface GraphNode {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  categoryName: string;
  createdAt: string;
  views: number;
}

interface GraphLink {
  source: any;
  target: any;
  weight: number;
  relationType: string;
  relationStrength: string;
  relationLabel: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const CATEGORY_COLORS = [
  "#0f766e",
  "#b45309",
  "#1d4ed8",
  "#7c3aed",
  "#be123c",
  "#15803d",
  "#374151",
  "#0e7490",
];

function nodeRadius(tagCount: number): number {
  return 6 + Math.min(tagCount, 5) * 1.2;
}

export function KnowledgeGraph({ posts }: KnowledgeGraphProps) {
  const [threshold, setThreshold] = useState<number>(0.4);
  const [graph, setGraph] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState<boolean>(true);
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Fetch dữ liệu từ API khi threshold thay đổi
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchGraphData() {
      try {
        const res = await fetch(`/api/kg?threshold=${threshold}`);
        if (!res.ok) throw new Error("Lỗi tải đồ thị");
        const data = await res.json();
        if (isMounted) {
          setGraph(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchGraphData();

    return () => {
      isMounted = false;
    };
  }, [threshold]);

  const categoryMeta = useMemo(() => {
    const map = new Map<string, { label: string; count: number; color: string }>();
    let colorIndex = 0;

    graph.nodes.forEach((node) => {
      const categoryLabel = (node.categoryName || "Không phân loại").trim();
      const key = categoryLabel.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        return;
      }

      map.set(key, {
        label: categoryLabel,
        count: 1,
        color: CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length],
      });
      colorIndex += 1;
    });

    return map;
  }, [graph.nodes]);

  const categoryColorByNodeId = useMemo(() => {
    const nodeColorMap = new Map<string, string>();
    graph.nodes.forEach((node) => {
      const categoryLabel = (node.categoryName || "Không phân loại").trim();
      const key = categoryLabel.toLowerCase();
      const meta = categoryMeta.get(key);
      nodeColorMap.set(node.id, meta?.color || "#374151");
    });
    return nodeColorMap;
  }, [graph.nodes, categoryMeta]);

  // Vẽ đồ thị D3
  useEffect(() => {
    const svgElement = svgRef.current;
    const wrapperElement = wrapperRef.current;

    if (!svgElement || !wrapperElement || graph.nodes.length === 0) return;

    const width = wrapperElement.clientWidth;
    const height = Math.max(560, Math.min(900, wrapperElement.clientHeight || 720));
    const svg = select(svgElement);

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const root = svg.append("g").attr("class", "kg-root");
    const linkLayer = root.append("g").attr("class", "kg-links");
    const nodeLayer = root.append("g").attr("class", "kg-nodes");

    const links = linkLayer
      .selectAll("line")
      .data(graph.links)
      .join("line")
      .attr("stroke", "rgba(120, 120, 120, 0.28)")
      .attr("stroke-width", (d) => Math.min(1 + d.weight * 3, 5));

    links.append("title").text((d) => d.relationLabel);

    const nodes = nodeLayer
      .selectAll("g")
      .data(graph.nodes)
      .join("g")
      .attr("class", "kg-node")
      .style("cursor", "pointer");

    nodes
      .append("circle")
      .attr("r", (d) => nodeRadius(d.tags.length))
      .attr("fill", (d) => categoryColorByNodeId.get(d.id) || "#374151")
      .attr("stroke", "#f5f5f5")
      .attr("stroke-width", 1.5);

    nodes
      .append("text")
      .text((d) => d.title)
      .attr("x", 0)
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .attr("class", "select-none fill-neutral-600 dark:fill-neutral-300")
      .attr("opacity", 0);

    nodes.append("title").text((d) => {
      const tags = d.tags.length > 0 ? d.tags.join(", ") : "Không có tag";
      return `${d.title}\nTag: ${tags}\nCập nhật: ${formatDate(d.createdAt)}`;
    });

    const neighborMap = new Map<string, Set<string>>();
    graph.nodes.forEach((node) => {
      neighborMap.set(node.id, new Set([node.id]));
    });
    graph.links.forEach((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      neighborMap.get(sourceId)?.add(targetId);
      neighborMap.get(targetId)?.add(sourceId);
    });

    const resetHighlight = () => {
      links.attr("opacity", 0.6).attr("stroke", "rgba(120, 120, 120, 0.2)");
      nodes.select("circle").attr("opacity", 1).attr("stroke-width", 1.5).attr("stroke", "#f5f5f5");
      nodes.select("text").attr("opacity", 0);
    };

    nodes
      .on("mouseenter", (_, hoveredNode) => {
        const neighbors = neighborMap.get(hoveredNode.id) ?? new Set([hoveredNode.id]);
        links
          .attr("opacity", (link) => {
            const sId = typeof link.source === "object" ? link.source.id : link.source;
            const tId = typeof link.target === "object" ? link.target.id : link.target;
            return sId === hoveredNode.id || tId === hoveredNode.id ? 1 : 0.05;
          })
          .attr("stroke", (link) => {
            const sId = typeof link.source === "object" ? link.source.id : link.source;
            const tId = typeof link.target === "object" ? link.target.id : link.target;
            return sId === hoveredNode.id || tId === hoveredNode.id
              ? "#3b82f6"
              : "rgba(120, 120, 120, 0.05)";
          });

        nodes
          .select("circle")
          .attr("opacity", (node) => (neighbors.has(node.id) ? 1 : 0.15))
          .attr("stroke-width", (node) => (node.id === hoveredNode.id ? 2.5 : 1.5))
          .attr("stroke", (node) => (node.id === hoveredNode.id ? "#3b82f6" : "#f5f5f5"));

        nodes
          .select("text")
          .attr("opacity", (node) => (neighbors.has(node.id) ? 1 : 0))
          .attr("font-weight", (node) => (node.id === hoveredNode.id ? 600 : 400));
      })
      .on("mouseleave", resetHighlight);

    resetHighlight();

    nodes.on("click", (_, d) => {
      window.location.href = `/post/${d.slug}`;
    });

    const simulation = forceSimulation(graph.nodes as any)
      .force(
        "link",
        forceLink(graph.links)
          .id((d: any) => d.id)
          .distance((d: any) => 120 - Math.min(d.weight, 1) * 60)
          .strength(0.5)
      )
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(width / 2, height / 2).strength(0.08))
      .force("collision", forceCollide().radius((d: any) => nodeRadius(d.tags.length) + 12))
      .force("boundX", forceX(width / 2).strength(0.04))
      .force("boundY", forceY(height / 2).strength(0.04));

    const dragBehavior = drag<SVGGElement, any>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodes.call(dragBehavior as any);

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3.0])
      .on("zoom", (event) => {
        root.attr("transform", event.transform.toString());
      });

    svg.call(zoomBehavior as any);

    return () => {
      simulation.stop();
      svg.on(".zoom", null);
    };
  }, [graph, categoryColorByNodeId]);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const svgElement = svgRef.current;

    if (!wrapperElement || !svgElement) return;

    const observer = new ResizeObserver(() => {
      const width = wrapperElement.clientWidth;
      const height = Math.max(560, Math.min(900, wrapperElement.clientHeight || 720));
      select(svgElement).attr("viewBox", `0 0 ${width} ${height}`);
    });

    observer.observe(wrapperElement);
    return () => observer.disconnect();
  }, []);

  const isEmpty = graph.nodes.length === 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/90 shadow-sm backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/70">
      <div className="flex flex-col gap-4 border-b border-neutral-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800/70">
        <div>
          <p className="font-serif text-base font-semibold text-neutral-900 dark:text-white">
            Knowledge Graph (Đồ thị tri thức)
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Node: Bài viết · Cạnh nối: Điểm tương quan tính toán từ tag phân cấp & danh mục
          </p>
        </div>

        {/* Thanh trượt điều chỉnh ngưỡng liên kết */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 dark:border-neutral-800/60 dark:bg-neutral-900/50 min-w-[260px]">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-neutral-500 dark:text-neutral-400">Lọc tương quan từ:</span>
            <span className="text-blue-600 dark:text-blue-400">≥ {(threshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 dark:bg-neutral-700 accent-blue-600 dark:accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-neutral-400 dark:text-neutral-500">
            <span>Yếu (30%)</span>
            <span>Vừa (50%)</span>
            <span>Mạnh (80%+)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-neutral-200/70 px-5 py-3 text-[10px] dark:border-neutral-800/70">
        {Array.from(categoryMeta.values()).map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>
              {item.label} ({item.count})
            </span>
          </div>
        ))}
        <div className="ml-auto font-medium text-neutral-500 dark:text-neutral-400">
          Tổng số: {graph.nodes.length} bài viết · {graph.links.length} liên kết
        </div>
      </div>

      <div ref={wrapperRef} className="relative h-[72vh] min-h-[560px] w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-neutral-950/70">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-500" />
          </div>
        )}

        {isEmpty && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 px-6 text-center backdrop-blur-sm dark:bg-neutral-950/70">
            <p className="font-serif text-sm text-neutral-500 dark:text-neutral-400">
              Không có dữ liệu bài viết để hiển thị đồ thị.
            </p>
          </div>
        )}

        {!isEmpty && graph.links.length === 0 && !loading && (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-xl border border-neutral-200/70 bg-white/80 px-4 py-2 text-center backdrop-blur-sm dark:border-neutral-700/70 dark:bg-neutral-900/80">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Không có liên kết nào đạt ngưỡng tương quan { (threshold * 100).toFixed(0) }%. Hãy giảm ngưỡng để xem các kết nối yếu hơn.
            </p>
          </div>
        )}

        <svg ref={svgRef} className="h-full w-full" role="img" aria-label="Knowledge graph of posts" />
      </div>
    </div>
  );
}
