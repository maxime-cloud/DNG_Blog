import { queryCollectionNavigation } from '#content' // This might not work directly, just trying to see syntax

async function test() {
  try {
    const nav = await queryCollectionNavigation('docs')
    console.log(JSON.stringify(nav, null, 2))
  } catch (e) {
    console.error(e)
  }
}
test()
