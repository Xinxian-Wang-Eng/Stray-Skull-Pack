import {
    world,
    system,
    EquipmentSlot
} from "@minecraft/server";

const previousMainhand = new Map();

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {

        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable) continue;

        const chestItem = equippable.getEquipment(EquipmentSlot.Chest);
        const mainhandItem = equippable.getEquipment(EquipmentSlot.Mainhand);

        const currentMainhand = mainhandItem?.typeId;
        const oldMainhand = previousMainhand.get(player.id);

        const switchedToMace =
            currentMainhand === "minecraft:mace" &&
            oldMainhand !== "minecraft:mace";

        const switchedToRocket =
            currentMainhand === "minecraft:firework_rocket" &&
            oldMainhand !== "minecraft:firework_rocket";


        // Elytra -> Chestplate
        if (
            switchedToMace &&
            player.isGliding &&
            chestItem?.typeId === "minecraft:elytra"
        ) {
            const inventory = player.getComponent("minecraft:inventory");

            if (!inventory?.container) {
                continue;
            }

            for (let slot = 0; slot < 9; slot++) {
                const item = inventory.container.getItem(slot);

                if (!item) continue;

                if (
                    item.typeId === "minecraft:diamond_chestplate" ||
                    item.typeId === "minecraft:netherite_chestplate" ||
                    item.typeId === "minecraft:iron_chestplate" ||
                    item.typeId === "minecraft:golden_chestplate" ||
                    item.typeId === "minecraft:chainmail_chestplate" ||
                    item.typeId === "minecraft:leather_chestplate"
                ) {
                    const elytra = chestItem;
                    const chestplate = item;

                    const equipped = equippable.setEquipment(
                        EquipmentSlot.Chest,
                        chestplate
                    );

                    if (!equipped) {
                        player.sendMessage("Armor swap failed.");
                        break;
                    }

                    inventory.container.setItem(slot, elytra);

                    player.addEffect("resistance", 40, {
                        amplifier: 3,
                        showParticles: true
                    });

                    player.addEffect("slowness", 40, {
                        amplifier: 2,
                        showParticles: true
                    });

                    break;
                }
            }
        }


        // Chestplate -> Elytra
        if (
            switchedToRocket &&
            chestItem?.typeId !== "minecraft:elytra"
        ) {
            const inventory = player.getComponent("minecraft:inventory");

            if (!inventory?.container) {
                continue;
            }

            for (let slot = 0; slot < 9; slot++) {
                const item = inventory.container.getItem(slot);

                if (!item) continue;

                if (item.typeId === "minecraft:elytra") {
                    const chestplate = chestItem;
                    const elytra = item;

                    const equipped = equippable.setEquipment(
                        EquipmentSlot.Chest,
                        elytra
                    );

                    if (!equipped) {
                        break;
                    }

                    inventory.container.setItem(slot, chestplate);

                    break;
                }
            }
        }


        // Save current mainhand state for next tick
        previousMainhand.set(player.id, currentMainhand);
    }
}, 1);