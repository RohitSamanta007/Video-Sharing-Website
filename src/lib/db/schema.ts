import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, serial, uuid, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});


export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("createdAt").$defaultFn(()=> new Date()).notNull(),
})

export const post = pgTable("post", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  videoUrl: text("videoUrl").notNull(),
  videoKey: text("videoKey").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey").notNull(),
  isPublic: boolean("isPublic").default(false),
  isPending: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").$defaultFn(()=> new Date()), 
  updatedAt: timestamp("createdAt").$defaultFn(()=> new Date()), 
})

// post and category has many to many relations : one post - multiple category and one category can be with multiple post
export const postCategory = pgTable("postCategory", {
  postId: uuid("postId").notNull().references(()=> post.id, {onDelete: "cascade"}),
  categoryId: integer("categoryId").notNull().references(()=> category.id, {onDelete: "cascade"}),
})

// relation of post, category and post category
export const postRelations = relations(post, ({many}) => ({
  categories: many(postCategory)
}))

export const categoryRealtions = relations(category, ({many}) =>({
  posts: many(postCategory)
}))

export const postCategoryRelations = relations(postCategory, ({one}) =>({
  post: one(post, {
    fields: [postCategory.postId],
    references: [post.id]
  }),
  category: one(category, {
    fields: [postCategory.categoryId],
    references: [category.id],
  })
}))
