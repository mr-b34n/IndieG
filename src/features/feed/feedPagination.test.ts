import { describe, it, expect } from "vitest";
import { mapPostDtoToPostData, extractPostList } from "@/shared/api";
import type { PostDto } from "@/shared/api/types";

describe("Feed Pagination & Post Mapping", () => {
    it("should map post DTO with valid timestamp and createdAt", () => {
        const sampleDto: PostDto = {
            id: "post-uuid-1",
            title: "Test Post",
            content: "Content of the test post",
            createdAt: "2026-11-09T10:00:00.000Z",
            updatedAt: "2026-11-09T10:00:00.000Z",
            communityId: "comm-1",
            authorId: "user-1",
            upvotes: 10,
            downvotes: 2,
        };

        const mapped = mapPostDtoToPostData(sampleDto);

        expect(mapped.id).toBe("post-uuid-1");
        expect(mapped.title).toBe("Test Post");
        expect(mapped.createdAt).toBe("2026-11-09T10:00:00.000Z");
        expect(mapped.timestamp).toBe(new Date("2026-11-09T10:00:00.000Z").getTime());
        expect(mapped.score).toBe(8);
    });

    it("should correctly extract posts from paginated response", () => {
        const paginatedResponse = {
            data: [
                { id: "post-1", title: "Post 1", content: "Content 1" },
                { id: "post-2", title: "Post 2", content: "Content 2" },
            ],
            meta: {
                total: 200,
                page: 1,
                limit: 15,
                totalPages: 14,
            },
        };

        const extracted = extractPostList(paginatedResponse);
        expect(extracted).toHaveLength(2);
        expect(extracted[0].id).toBe("post-1");
        expect(extracted[1].id).toBe("post-2");
    });

    it("should calculate next page accurately based on pagination meta", () => {
        const getNextPage = (lastPage: { meta?: { page?: number; totalPages?: number }; data?: unknown[] }, allPagesLength: number) => {
            if (lastPage?.meta) {
                const { page, totalPages } = lastPage.meta;
                if (typeof page === "number" && typeof totalPages === "number") {
                    return page < totalPages ? page + 1 : undefined;
                }
            }
            return allPagesLength + 1;
        };

        // When on page 1 of 14, should return page 2
        expect(getNextPage({ meta: { page: 1, totalPages: 14 } }, 1)).toBe(2);

        // When on page 13 of 14, should return page 14
        expect(getNextPage({ meta: { page: 13, totalPages: 14 } }, 13)).toBe(14);

        // When on page 14 of 14, should return undefined (end of feed)
        expect(getNextPage({ meta: { page: 14, totalPages: 14 } }, 14)).toBeUndefined();
    });
});
