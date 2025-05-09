import { Model } from "@nozbe/watermelondb"
import { field, text, date } from "@nozbe/watermelondb/decorators"

export default class FAQ extends Model {
  static table = "faqs"

  @text("question") question
  @text("answer") answer
  @text("category") category
  @text("keywords") keywords
  @field("is_popular") isPopular
  @date("created_at") createdAt
  @date("updated_at") updatedAt
}
