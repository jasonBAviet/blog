import { Post } from "@/types";

export interface KnowledgeGraphNode {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  categoryName?: string;
  createdAt: string;
  views: number;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  sharedTags: string[];
  weight: number;
  relationType: "shared_tags";
  relationStrength: "weak" | "medium" | "strong";
  relationLabel: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function uniqueTags(tags: string[] = []): string[] {
  return Array.from(new Set(tags.map(normalizeTag).filter(Boolean)));
}

function getRelationStrength(weight: number): "weak" | "medium" | "strong" {
  if (weight >= 3) return "strong";
  if (weight === 2) return "medium";
  return "weak";
}

export function buildKnowledgeGraph(posts: Post[]): KnowledgeGraphData {
  const nodes = posts.map((post) => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    tags: uniqueTags(post.tags),
    categoryName: post.categoryName,
    createdAt: post.createdAt,
    views: post.views,
  }));

  const links: KnowledgeGraphLink[] = [];

  for (let i = 0; i < nodes.length; i += 1) {
    const current = nodes[i];

    for (let j = i + 1; j < nodes.length; j += 1) {
      const candidate = nodes[j];
      const sharedTags = current.tags.filter((tag) => candidate.tags.includes(tag));

      if (sharedTags.length === 0) continue;

      const weight = sharedTags.length;

      links.push({
        source: current.id,
        target: candidate.id,
        sharedTags,
        weight,
        relationType: "shared_tags",
        relationStrength: getRelationStrength(weight),
        relationLabel: `${weight} shared tag${weight > 1 ? "s" : ""}`,
      });
    }
  }

  return { nodes, links };
}