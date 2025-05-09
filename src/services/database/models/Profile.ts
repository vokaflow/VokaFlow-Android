import { Model } from "@nozbe/watermelondb"
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators"
import type { Associations } from "@nozbe/watermelondb/Model"

export default class Profile extends Model {
  static table = "profiles"

  static associations: Associations = {
    users: { type: "has_one", foreignKey: "profile_id" },
    chats: { type: "has_many", foreignKey: "profile_id" },
    contacts: { type: "has_many", foreignKey: "profile_id" },
    settings: { type: "has_many", foreignKey: "profile_id" },
    media_files: { type: "has_many", foreignKey: "profile_id" },
  }

  @text("name") name!: string
  @text("type") type!: "personal" | "professional"
  @text("avatar") avatar?: string
  @text("theme") theme!: string
  @text("firebase_uid") firebaseUid?: string
  @field("is_active") isActive!: boolean
  @readonly @date("created_at") createdAt!: Date
  @readonly @date("updated_at") updatedAt!: Date
}
