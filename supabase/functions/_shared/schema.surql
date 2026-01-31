-- Apples table
DEFINE TABLE apples SCHEMAFULL;
DEFINE FIELD type ON apples TYPE string ASSERT $value = "apple";
DEFINE FIELD attributes ON apples TYPE object;
DEFINE FIELD attributes.size ON apples TYPE option<float>;
DEFINE FIELD attributes.weight ON apples TYPE option<float>;
DEFINE FIELD attributes.hasStem ON apples TYPE option<bool>;
DEFINE FIELD attributes.hasLeaf ON apples TYPE option<bool>;
DEFINE FIELD attributes.hasWorm ON apples TYPE option<bool>;
DEFINE FIELD attributes.shineFactor ON apples TYPE option<string>;
DEFINE FIELD attributes.hasChemicals ON apples TYPE option<bool>;
DEFINE FIELD preferences ON apples TYPE object;
DEFINE FIELD createdAt ON apples TYPE datetime DEFAULT time::now();

-- Oranges table
DEFINE TABLE oranges SCHEMAFULL;
DEFINE FIELD type ON oranges TYPE string ASSERT $value = "orange";
DEFINE FIELD attributes ON oranges TYPE object;
DEFINE FIELD attributes.size ON oranges TYPE option<float>;
DEFINE FIELD attributes.weight ON oranges TYPE option<float>;
DEFINE FIELD attributes.hasStem ON oranges TYPE option<bool>;
DEFINE FIELD attributes.hasLeaf ON oranges TYPE option<bool>;
DEFINE FIELD attributes.hasWorm ON oranges TYPE option<bool>;
DEFINE FIELD attributes.shineFactor ON oranges TYPE option<string>;
DEFINE FIELD attributes.hasChemicals ON oranges TYPE option<bool>;
DEFINE FIELD preferences ON oranges TYPE object;
DEFINE FIELD createdAt ON oranges TYPE datetime DEFAULT time::now();

-- Indexes for faster querying
DEFINE INDEX idx_apple_created ON apples FIELDS createdAt;
DEFINE INDEX idx_orange_created ON oranges FIELDS createdAt;
