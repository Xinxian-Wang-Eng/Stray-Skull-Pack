import { world, ItemStack } from "@minecraft/server";

const chargedExplosions = [];

world.beforeEvents.explosion.subscribe((event) => {
    const source = event.source;

    if (!source) return;
    if (source.typeId !== "minecraft:creeper") return;

    if (!source.hasComponent("minecraft:is_charged")) return;

    chargedExplosions.push({
        dimension: event.dimension.id,
        x: source.location.x,
        y: source.location.y,
        z: source.location.z
    });

    // Keep the list small
    if (chargedExplosions.length > 20) {
        chargedExplosions.shift();
    }
});

world.afterEvents.entityDie.subscribe((event) => {
    const dead = event.deadEntity;

    if (dead.typeId !== "minecraft:stray") return;

    const loc = dead.location;
    const dim = dead.dimension.id;

    const nearbyChargedExplosion = chargedExplosions.some((e) => {
        if (e.dimension !== dim) return false;

        const dx = e.x - loc.x;
        const dy = e.y - loc.y;
        const dz = e.z - loc.z;

        return dx * dx + dy * dy + dz * dz < 64;
    });

    if (!nearbyChargedExplosion) return;
    if (Math.random() >= 0.5) return;
    const skull = new ItemStack("minecraft:wither_skeleton_skull", 1);
    dead.dimension.spawnItem(skull, dead.location);
});