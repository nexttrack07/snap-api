import { PrismaClient, Block as PrismaBlock, BlockCategory as PrismaBlockCategory } from '@prisma/client';
import { Static, Type } from '@sinclair/typebox';
import { prisma } from '../db-connect';

export const Block = Type.Object({
    id: Type.Optional(Type.String()),
    userId: Type.Optional(Type.String()),
    elements: Type.String(),
    url: Type.Optional(Type.String()),
    categoryId: Type.Number(),
})

export type BlockType = Static<typeof Block>

export const BlockCategory = Type.Object({
    id: Type.Optional(Type.Number()),
    name: Type.String(),
})

export type BlockCategoryType = Static<typeof BlockCategory>

class BlockRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async createBlock(data: BlockType, userId: string): Promise<PrismaBlock> {
        return this.prisma.block.create({
            data: {
                ...data,
                userId,
                url: data.url || "",
            },
        });
    }

    async getAllBlocks(): Promise<PrismaBlock[]> {
        return this.prisma.block.findMany();
    }

    async getBlockById(id: string): Promise<PrismaBlock | null> {
        return this.prisma.block.findUnique({
            where: { id },
        });
    }

    async updateBlock(id: string, data: Partial<BlockType>): Promise<PrismaBlock> {
        return this.prisma.block.update({
            where: { id },
            data,
        });
    }

    async deleteBlock(id: string): Promise<PrismaBlock> {
        return this.prisma.block.delete({
            where: { id },
        });
    }

    async createCategory(data: BlockCategoryType): Promise<PrismaBlockCategory> {
        return this.prisma.blockCategory.create({
            data,
        });
    }

    async getAllCategories(): Promise<PrismaBlockCategory[]> {
        return this.prisma.blockCategory.findMany({
            include: {
                blocks: true,
            }
        });
    }

    async getCategoryById(id: number): Promise<PrismaBlockCategory | null> {
        return this.prisma.blockCategory.findUnique({
            where: { id },
        });
    }

    async updateCategory(id: number, data: Partial<BlockCategoryType>): Promise<PrismaBlockCategory> {
        return this.prisma.blockCategory.update({
            where: { id },
            data,
        });
    }

    async deleteCategory(id: number): Promise<PrismaBlockCategory> {
        return this.prisma.blockCategory.delete({
            where: { id },
        });
    }
}

export default new BlockRepository(prisma);
