"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    if (!process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD is not set');
    }
    const hashedPassword = await bcrypt_1.default.hash(process.env.ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            role: client_1.Role.ADMIN,
            isActive: true,
        },
    });
    console.log('✅ Admin user seeded');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map