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
DEFINE FIELD preferences.size ON apples FLEXIBLE TYPE option<object>;
DEFINE FIELD preferences.size.min ON apples TYPE option<float>;
DEFINE FIELD preferences.size.max ON apples TYPE option<float>;
DEFINE FIELD preferences.weight ON apples FLEXIBLE TYPE option<object>;
DEFINE FIELD preferences.weight.min ON apples TYPE option<float>;
DEFINE FIELD preferences.weight.max ON apples TYPE option<float>;
DEFINE FIELD preferences.hasStem ON apples TYPE option<bool>;
DEFINE FIELD preferences.hasLeaf ON apples TYPE option<bool>;
DEFINE FIELD preferences.hasWorm ON apples TYPE option<bool>;
DEFINE FIELD preferences.shineFactor ON apples FLEXIBLE TYPE option<string|array<string>>;
DEFINE FIELD preferences.hasChemicals ON apples TYPE option<bool>;
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
DEFINE FIELD preferences.size ON oranges FLEXIBLE TYPE option<object>;
DEFINE FIELD preferences.size.min ON oranges TYPE option<float>;
DEFINE FIELD preferences.size.max ON oranges TYPE option<float>;
DEFINE FIELD preferences.weight ON oranges FLEXIBLE TYPE option<object>;
DEFINE FIELD preferences.weight.min ON oranges TYPE option<float>;
DEFINE FIELD preferences.weight.max ON oranges TYPE option<float>;
DEFINE FIELD preferences.hasStem ON oranges TYPE option<bool>;
DEFINE FIELD preferences.hasLeaf ON oranges TYPE option<bool>;
DEFINE FIELD preferences.hasWorm ON oranges TYPE option<bool>;
DEFINE FIELD preferences.shineFactor ON oranges FLEXIBLE TYPE option<string|array<string>>;
DEFINE FIELD preferences.hasChemicals ON oranges TYPE option<bool>;
DEFINE FIELD createdAt ON oranges TYPE datetime DEFAULT time::now();

-- Indexes for faster querying
DEFINE INDEX idx_apple_created ON apples FIELDS createdAt;
DEFINE INDEX idx_orange_created ON oranges FIELDS createdAt;

-- Matching Algorithm registry
-- Stores available matching algorithms that can be selected in the dashboard
DEFINE TABLE matching_algorithm SCHEMAFULL;
DEFINE FIELD key ON matching_algorithm TYPE string;
DEFINE FIELD name ON matching_algorithm TYPE string;
DEFINE FIELD version ON matching_algorithm TYPE string;
DEFINE FIELD description ON matching_algorithm TYPE string;
DEFINE FIELD status ON matching_algorithm TYPE string ASSERT $value IN ["active", "deprecated"];
DEFINE FIELD defaultConfig ON matching_algorithm TYPE option<object>;
DEFINE FIELD createdAt ON matching_algorithm TYPE datetime DEFAULT time::now();

DEFINE INDEX idx_algorithm_key ON matching_algorithm FIELDS key UNIQUE;
DEFINE INDEX idx_algorithm_status ON matching_algorithm FIELDS status;

-- Match table
-- Represents one produced match between an apple and an orange
DEFINE TABLE match SCHEMAFULL;

-- Identity and context
DEFINE FIELD incomingFruitId ON match TYPE record;
DEFINE FIELD incomingKind ON match TYPE string ASSERT $value IN ["apple", "orange"];
DEFINE FIELD appleId ON match TYPE record<apples>;
DEFINE FIELD orangeId ON match TYPE record<oranges>;

-- Algorithm metadata (denormalized for historical queries)
DEFINE FIELD matchingAlgorithmId ON match TYPE record<matching_algorithm>;
DEFINE FIELD matchingAlgorithmName ON match TYPE string;
DEFINE FIELD matchingAlgorithmVersion ON match TYPE string;

-- Scoring
DEFINE FIELD overallScore ON match TYPE float ASSERT $value >= 0 AND $value <= 1;
DEFINE FIELD scoreAppleOnOrange ON match TYPE float ASSERT $value >= 0 AND $value <= 1;
DEFINE FIELD scoreOrangeOnApple ON match TYPE float ASSERT $value >= 0 AND $value <= 1;

-- Constraints
DEFINE FIELD passedHardConstraints ON match TYPE bool;
DEFINE FIELD violations ON match TYPE option<array<string>>;

-- Agreement state (per-party status)
DEFINE FIELD appleStatus ON match TYPE string ASSERT $value IN ["pending", "accepted", "rejected"];
DEFINE FIELD orangeStatus ON match TYPE string ASSERT $value IN ["pending", "accepted", "rejected"];
DEFINE FIELD status ON match TYPE string ASSERT $value IN ["proposed", "mutual_match", "rejected", "expired"];

-- Explanation
DEFINE FIELD reason ON match TYPE string;
DEFINE FIELD reasonData ON match TYPE option<object>;

-- Lifecycle
DEFINE FIELD createdAt ON match TYPE datetime DEFAULT time::now();

-- Indexes for match queries
DEFINE INDEX idx_match_apple ON match FIELDS appleId;
DEFINE INDEX idx_match_orange ON match FIELDS orangeId;
DEFINE INDEX idx_match_status ON match FIELDS status;
DEFINE INDEX idx_match_algorithm ON match FIELDS matchingAlgorithmId;
DEFINE INDEX idx_match_created ON match FIELDS createdAt;
