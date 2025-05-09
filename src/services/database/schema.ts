import { appSchema, tableSchema } from "@nozbe/watermelondb"

export default appSchema({
  version: 3, // Incrementamos la versión del esquema
  tables: [
    // Tablas existentes...
    tableSchema({
      name: "profiles",
      columns: [
        { name: "name", type: "string" },
        { name: "type", type: "string" },
        { name: "avatar", type: "string", isOptional: true },
        { name: "theme", type: "string" },
        { name: "firebase_uid", type: "string", isOptional: true },
        { name: "is_active", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "users",
      columns: [
        { name: "profile_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "email", type: "string" },
        { name: "phone", type: "string", isOptional: true },
        { name: "avatar", type: "string", isOptional: true },
        { name: "status", type: "string", isOptional: true },
        { name: "firebase_uid", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    // Otras tablas existentes...
    tableSchema({
      name: "faqs",
      columns: [
        { name: "question", type: "string" },
        { name: "answer", type: "string" },
        { name: "category", type: "string" },
        { name: "keywords", type: "string" },
        { name: "is_popular", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    // Nueva tabla para misiones diarias
    tableSchema({
      name: "daily_missions",
      columns: [
        { name: "mission_id", type: "string" },
        { name: "profile_id", type: "string", isIndexed: true },
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "icon", type: "string" },
        { name: "action_type", type: "string" },
        { name: "target_value", type: "number" },
        { name: "current_value", type: "number" },
        { name: "points_reward", type: "number" },
        { name: "is_completed", type: "boolean" },
        { name: "is_claimed", type: "boolean" },
        { name: "expires_at", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    // Nueva tabla para recompensas especiales de misiones
    tableSchema({
      name: "mission_rewards",
      columns: [
        { name: "reward_id", type: "string" },
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "icon", type: "string" },
        { name: "rarity", type: "string" }, // común, raro, épico, legendario
        { name: "type", type: "string" }, // tema, avatar, sonido, emoji, etc.
        { name: "data", type: "string" }, // JSON con datos específicos de la recompensa
        { name: "created_at", type: "number" },
      ],
    }),
    // Nueva tabla para seguimiento de misiones completadas
    tableSchema({
      name: "mission_history",
      columns: [
        { name: "profile_id", type: "string", isIndexed: true },
        { name: "mission_id", type: "string" },
        { name: "completed_at", type: "number" },
        { name: "points_earned", type: "number" },
        { name: "reward_id", type: "string", isOptional: true },
      ],
    }),
  ],
})
