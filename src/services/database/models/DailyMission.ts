import { Model } from "@nozbe/watermelondb"
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators"

export default class DailyMission extends Model {
  static table = "daily_missions"

  @text("mission_id") missionId
  @text("title") title
  @text("description") description
  @text("icon") icon
  @text("action_type") actionType
  @field("target_value") targetValue
  @field("current_value") currentValue
  @field("points_reward") pointsReward
  @field("is_completed") isCompleted
  @field("is_claimed") isClaimed
  @date("expires_at") expiresAt
  @readonly @date("created_at") createdAt
  @readonly @date("updated_at") updatedAt
}
