"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { drag } from "d3-drag";
import { zoom } from "d3-zoom";
import { Post } from "@/types";
import { buildKnowledgeGraph } from "@/src/core/utils/knowledge-graph";
import { formatDate } from "@/src/core/utils/utils";

interface KnowledgeGraphProps {
  posts: Post[];
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

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function getTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag));
  }

  if (typeof input === "string") {
    return input.split(",");
  }

  return [];
}

export function KnowledgeGraph({ posts }: KnowledgeGraphProps) {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const tagOptions = useMemo(() => {
    const tagMap = new Map<string, string>();

    posts.forEach((post) => {
      getTags(post.tags).forEach((tag) => {
        const normalized = normalizeTag(tag);
        if (!normalized || tagMap.has(normalized)) return;
        tagMap.set(normalized, tag.trim());
      });
    });

    return Array.from(tagMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedTag === "all") return posts;
    return posts.filter((post) =>
      getTags(post.tags).some((tag) => normalizeTag(tag) === selectedTag)
    );
  }, [posts, selectedTag]);

  const graph = useMemo(() => buildKnowledgeGraph(filteredPosts), [filteredPosts]);

  const categoryMeta = useMemo(() => {
    const map = new Map<string, { label: string; count: number; color: string }>();
    let colorIndex = 0;

    graph.nodes.forEach((node) => {
      const categoryLabel = (node.categoryName || "Không phân loại").trim() || "Không phân loại";
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
      const categoryLabel = (node.categoryName || "Không phân loại").trim() || "Không phân loại";
      const key = categoryLabel.toLowerCase();
      const meta = categoryMeta.get(key);
      nodeColorMap.set(node.id, meta?.color || "#374151");
    });

    return nodeColorMap;
  }, [graph.nodes, categoryMeta]);

  useEffect(() => {
    const svgElement = svgRef.current;
    const wrapperElement = wrapperRef.current;

    if (!svgElement || !wrapperElement) return;

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
      .attr("data-source", (d) => d.source)
      .attr("data-target", (d) => d.target)
      .attr("stroke", "rgba(120, 120, 120, 0.28)")
      .attr("stroke-width", (d) => Math.min(1 + d.weight * 0.7, 4));

    links.append("title").text((d) => {
      const tags = d.sharedTags.join(", ");
      return `${d.relationLabel}\nLoại: ${d.relationType}\nĐộ mạnh: ${d.relationStrength}\nTag: ${tags}`;
    });

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
      .attr("stroke", (d) => (d.tags.length === 0 ? "rgba(150,150,150,0.5)" : "#f5f5f5"))
      .attr("stroke-width", (d) => (d.tags.length === 0 ? 1 : 1.5))
      .attr("stroke-dasharray", (d) => (d.tags.length === 0 ? "3,2" : "none"))
      .attr("opacity", (d) => (d.tags.length === 0 ? 0.6 : 1));

    nodes
      .append("text")
      .text((d) => d.title)
      .attr("x", 0)
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "currentColor")
      .attr("class", "select-none fill-neutral-600 dark:fill-neutral-300");

    nodes.append("title").text((d) => {
      const tags = d.tags.length > 0 ? d.tags.join(", ") : "Không có tag";
      return `${d.title}\nTag: ${tags}\nCập nhật: ${formatDate(d.createdAt)}`;
    });

    const neighborMap = new Map<string, Set<string>>();
    graph.nodes.forEach((node) => {
      neighborMap.set(node.id, new Set([node.id]));
    });
    graph.links.forEach((link) => {
      const sourceNeighbors = neighborMap.get(link.source);
      const targetNeighbors = neighborMap.get(link.target);
      sourceNeighbors?.add(link.target);
      targetNeighbors?.add(link.source);
    });

    const resetHighlight = () => {
      links
        .attr("opacity", 1)
        .attr("stroke", "rgba(120, 120, 120, 0.28)");

      nodes
        .select("circle")
        .attr("opacity", (d) => (d.tags.length === 0 ? 0.6 : 1))
        .attr("stroke-width", (d) => (d.tags.length === 0 ? 1 : 1.5))
        .attr("stroke", (d) => (d.tags.length === 0 ? "rgba(150,150,150,0.5)" : "#f5f5f5"));

      nodes
        .select("text")
        .attr("opacity", 1)
        .attr("font-weight", 400);
    };

    nodes
      .on("mouseenter", (_, hoveredNode) => {
        const neighbors = neighborMap.get(hoveredNode.id) ?? new Set([hoveredNode.id]);

        links
          .attr("opacity", (link) =>
            link.source === hoveredNode.id || link.target === hoveredNode.id ? 1 : 0.12
          )
          .attr("stroke", (link) =>
            link.source === hoveredNode.id || link.target === hoveredNode.id
              ? "rgba(30, 41, 59, 0.75)"
              : "rgba(120, 120, 120, 0.18)"
          );

        nodes
          .select("circle")
          .attr("opacity", (node) => (neighbors.has(node.id) ? 1 : 0.2))
          .attr("stroke-width", (node) => (node.id === hoveredNode.id ? 3 : 1.5))
          .attr("stroke", (node) => (node.id === hoveredNode.id ? "#0f172a" : "#f5f5f5"));

        nodes
          .select("text")
          .attr("opacity", (node) => (neighbors.has(node.id) ? 1 : 0.35))
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
          .distance((d: any) => 150 - Math.min(d.weight, 4) * 12)
          .strength(0.4)
      )
      .force("charge", forceManyBody().strength(-240))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collision", forceCollide().radius((d: any) => nodeRadius(d.tags.length) + 12));

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
      .scaleExtent([0.4, 2.5])
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
  const isolatedCount = graph.nodes.filter(
    (n) => !graph.links.some((l) => l.source === n.id || l.target === n.id)
  ).length;

  const selectedTagLabel =
    selectedTag === "all"
      ? "tất cả"
      : tagOptions.find((option) => option.value === selectedTag)?.label || selectedTag;

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/90 shadow-sm backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/70">
      <div className="flex flex-col gap-3 border-b border-neutral-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800/70">
        <div>
          <p className="font-serif text-base font-semibold text-neutral-900 dark:text-white">
            Knowledge Graph
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Mỗi node là một bài viết, cạnh nối giữa các bài có tag trùng nhau.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <label className="text-xs text-neutral-500 dark:text-neutral-400" htmlFor="kg-tag-filter">
            Lọc theo tag
          </label>
          <select
            id="kg-tag-filter"
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-neutral-500"
          >
            <option value="all">Tất cả tag</option>
            {tagOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {graph.nodes.length} bài viết · {graph.links.length} kết nối
            {isolatedCount > 0 && ` · ${isolatedCount} độc lập`}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-neutral-200/70 px-5 py-3 text-xs dark:border-neutral-800/70">
        {Array.from(categoryMeta.values()).map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>
              {item.label} ({item.count})
            </span>
          </div>
        ))}
      </div>

      <div ref={wrapperRef} className="relative h-[72vh] min-h-[560px] w-full">
        {isEmpty && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 px-6 text-center backdrop-blur-sm dark:bg-neutral-950/70">
            <div className="max-w-sm">
              <p className="font-serif text-lg font-semibold text-neutral-900 dark:text-white">
                Chưa có bài viết nào
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {selectedTag === "all"
                  ? "Chưa có bài viết nào trong hệ thống."
                  : `Không tìm thấy bài viết nào với tag "${selectedTagLabel}". Thử chọn tag khác hoặc quay lại tất cả tag.`}
              </p>
            </div>
          </div>
        )}

        {!isEmpty && graph.links.length === 0 && (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-xl border border-neutral-200/70 bg-white/80 px-4 py-2 text-center backdrop-blur-sm dark:border-neutral-700/70 dark:bg-neutral-900/80">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Các bài viết chưa có tag chung — thêm tag để tạo kết nối.
            </p>
          </div>
        )}

        <svg ref={svgRef} className="h-full w-full" role="img" aria-label="Knowledge graph of posts" />
      </div>
    </div>
  );
}
