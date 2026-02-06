const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const data = await prisma.priceData.findMany({
        where: { ticker: 'TEST_TICKER' },
        orderBy: { date: 'asc' }
    })
    console.log(JSON.stringify(data, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
