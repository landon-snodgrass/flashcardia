import { Monster, MonsterType } from "../types";

export interface MonsterTemplate {
  type: MonsterType;
  namePrefix: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  xpReward: number;
  goldReward: number;
  sprite: string;
  description: string;
}

export const MONSTER_TEMPLATES: Record<string, MonsterTemplate> = {
  slime: {
    type: "slime",
    namePrefix: "Slime",
    baseHp: 20,
    baseAttack: 5,
    baseDefense: 0,
    xpReward: 10,
    goldReward: 5,
    sprite: "🟢",
    description: "A weak gelatinous creature",
  },
  goblin: {
    type: "goblin",
    namePrefix: "Goblin",
    baseHp: 30,
    baseAttack: 8,
    baseDefense: 2,
    xpReward: 15,
    goldReward: 8,
    sprite: "👹",
    description: "A mischievous green creature",
  },
  orc: {
    type: "orc",
    namePrefix: "Orc",
    baseHp: 50,
    baseAttack: 12,
    baseDefense: 5,
    xpReward: 25,
    goldReward: 15,
    sprite: "👺",
    description: "A brutal warrior",
  },
  skeleton: {
    type: "skeleton",
    namePrefix: "Skeleton",
    baseHp: 40,
    baseAttack: 10,
    baseDefense: 3,
    xpReward: 20,
    goldReward: 12,
    sprite: "💀",
    description: "Animated bones of the undead",
  },
  dragon: {
    type: "dragon",
    namePrefix: "Dragon",
    baseHp: 80,
    baseAttack: 18,
    baseDefense: 8,
    xpReward: 50,
    goldReward: 30,
    sprite: "🐉",
    description: "A fearsome scaled beast",
  },
  boss: {
    type: "boss",
    namePrefix: "Dark Lord",
    baseHp: 120,
    baseAttack: 25,
    baseDefense: 12,
    xpReward: 100,
    goldReward: 50,
    sprite: "👑",
    description: "The ultimate challenge",
  },
};

export type DifficultyTier = "easy" | "medium" | "hard" | "boss";

export const DIFFICULTY_TO_MONSTER: Record<DifficultyTier, string> = {
  easy: "slime",
  medium: "goblin",
  hard: "orc",
  boss: "dragon",
};

/**
 * Get monster type based on player level (for daily study sessions)
 */
export function getMonsterTypeForLevel(playerLevel: number): string {
  if (playerLevel <= 3) return "slime";
  if (playerLevel <= 7) return "goblin";
  if (playerLevel <= 12) return "orc";
  if (playerLevel <= 18) return "skeleton";
  if (playerLevel <= 25) return "dragon";
  return "boss";
}

/**
 * Create a monster instance from a template
 */
export function createMonster(
  template: MonsterTemplate,
  playerLevel: number
): Monster {
  // Scale monster to player level
  const level = Math.max(1, playerLevel);
  const levelMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level

  const hp = Math.floor(template.baseHp * levelMultiplier);
  const attack = Math.floor(template.baseAttack * levelMultiplier);
  const defense = Math.floor(template.baseDefense * levelMultiplier);
  const xp = Math.floor(template.xpReward * levelMultiplier);
  const gold = Math.floor(template.goldReward * levelMultiplier);

  return {
    id: `${template.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${template.namePrefix} of Ignorance`,
    level,
    maxHp: hp,
    currentHp: hp,
    attackPower: attack,
    defense,
    xpReward: xp,
    goldReward: gold,
    sprite: template.sprite,
    description: template.description,
    type: template.type,
  };
}