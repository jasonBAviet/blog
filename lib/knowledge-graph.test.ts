import { describe, expect, it } from "vitest";
import { buildKnowledgeGraph } from "./knowledge-graph";
import type { Post } from "../types";

function makePost(partial: Partial<Post> & Pick<Post, "slug" | "title">): Post {
  return {
    slug: partial.slug,
    title: partial.title,
    content: partial.content || "",
    category: partial.category || "general",
    categoryName: partial.categoryName,
    tags: partial.tags,
    createdAt: partial.createdAt || "2026-01-01",
    views: partial.views ?? 0,
    reactions: partial.reactions,
    coverImage: partial.coverImage,
    images: partial.images,
    updatedAt: partial.updatedAt,
  };
}

describe("buildKnowledgeGraph", () => {
  it("builds links when tags overlap", () => {
    const posts: Post[] = [
      makePost({ slug: "a", title: "A", tags: ["react", "nextjs"] }),
      makePost({ slug: "b", title: "B", tags: ["nextjs", "typescript"] }),
      makePost({ slug: "c", title: "C", tags: ["golang"] }),
    ];

    const graph = buildKnowledgeGraph(posts);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.links).toHaveLength(1);
    expect(graph.links[0]).toMatchObject({
      source: "a",
      target: "b",
      sharedTags: ["nextjs"],
      weight: 1,
      relationType: "shared_tags",
      relationStrength: "weak",
      relationLabel: "1 shared tag",
    });
  });

  it("normalizes tags case-insensitively and deduplicates tags", () => {
    const posts: Post[] = [
      makePost({ slug: "a", title: "A", tags: [" React", "react", "NEXT"] }),
      makePost({ slug: "b", title: "B", tags: ["react", "next", "NEXT "] }),
    ];

    const graph = buildKnowledgeGraph(posts);

    expect(graph.nodes[0].tags).toEqual(["react", "next"]);
    expect(graph.nodes[1].tags).toEqual(["react", "next"]);
    expect(graph.links).toHaveLength(1);
    expect(graph.links[0].sharedTags).toEqual(["react", "next"]);
    expect(graph.links[0].weight).toBe(2);
    expect(graph.links[0].relationStrength).toBe("medium");
    expect(graph.links[0].relationLabel).toBe("2 shared tags");
  });

  it("does not create self-links or duplicate reverse links", () => {
    const posts: Post[] = [
      makePost({ slug: "a", title: "A", tags: ["tag-1"] }),
      makePost({ slug: "b", title: "B", tags: ["tag-1"] }),
      makePost({ slug: "c", title: "C", tags: ["tag-1"] }),
    ];

    const graph = buildKnowledgeGraph(posts);

    expect(graph.links).toHaveLength(3);

    const keys = graph.links.map((link) => `${link.source}->${link.target}`);
    expect(new Set(keys).size).toBe(keys.length);

    graph.links.forEach((link) => {
      expect(link.source).not.toBe(link.target);
      const reverse = `${link.target}->${link.source}`;
      expect(keys).not.toContain(reverse);
    });
  });

  it("creates no links when posts have no tags", () => {
    const posts: Post[] = [
      makePost({ slug: "a", title: "A" }),
      makePost({ slug: "b", title: "B", tags: [] }),
      makePost({ slug: "c", title: "C" }),
    ];

    const graph = buildKnowledgeGraph(posts);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.links).toEqual([]);
  });

  it("marks strong relation when three or more shared tags", () => {
    const posts: Post[] = [
      makePost({ slug: "a", title: "A", tags: ["x", "y", "z"] }),
      makePost({ slug: "b", title: "B", tags: ["x", "y", "z", "k"] }),
    ];

    const graph = buildKnowledgeGraph(posts);

    expect(graph.links).toHaveLength(1);
    expect(graph.links[0].weight).toBe(3);
    expect(graph.links[0].relationStrength).toBe("strong");
    expect(graph.links[0].relationLabel).toBe("3 shared tags");
  });
});
