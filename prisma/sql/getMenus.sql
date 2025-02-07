WITH RECURSIVE menu_recursion AS (
    SELECT id, name, "parentId", 1 AS level -- 初始化递归，level为1表示最顶层
    FROM public."Menu"
    WHERE "parentId" IS NULL -- 从顶级员工开始
    UNION ALL
    SELECT e.id, e.name, e.parentId, er.level + 1
    FROM public."Menu" e
    JOIN menu_recursion er ON e.parentId = er.id -- 连接自身以形成层级
)
SELECT * FROM menu_recursion;	
