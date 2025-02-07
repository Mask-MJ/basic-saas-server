WITH RECURSIVE menu_tree AS (
  SELECT id, name, parentId, ARRAY[id] AS path FROM menu WHERE parentId IS NULL
  UNION ALL 
  SELECT menu.id, menu.name, menu.parentId, menu_tree.path || menu.id 
  FROM menu_tree 
  JOIN menu ON menu.parentId = menu_tree.id
)
SELECT * FROM menu_tree;
