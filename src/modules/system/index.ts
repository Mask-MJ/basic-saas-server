import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { RoleController } from './role/role.controller';
import { RoleService } from './role/role.service';
import { MenuController } from './menu/menu.controller';
import { MenuService } from './menu/menu.service';
import { DictDataController } from './dict-data/dict-data.controller';
import { DictDataService } from './dict-data/dict-data.service';
import { DictTypeService } from './dict-type/dict-type.service';
import { DictTypeController } from './dict-type/dict-type.controller';
// import { DeptController } from './dept/dept.controller';

// import { PostService } from './post/post.service';
// import { PostController } from './post/post.controller';
// import { UnitService } from './unit/unit.service';
// import { UnitController } from './unit/unit.controller';
// import { RuleService } from './rule/rule.service';
// import { RuleController } from './rule/rule.controller';
// import { DictDataTreeService } from './dict-data-tree/dict-data-tree.service';
// import { DictDataTreeController } from './dict-data-tree/dict-data-tree.controller';
// import { DeptService } from './dept/dept.service';

export const systemControllers = [
  UserController,
  RoleController,
  MenuController,
  // DeptController,
  DictDataController,
  DictTypeController,
  // PostController,
  // UnitController,
  // RuleController,
  // DictDataTreeController,
];

export const systemProviders = [
  UserService,
  RoleService,
  MenuService,
  DictDataService,
  DictTypeService,
  // DeptService,
  // PostService,
  // UnitService,
  // RuleService,
  // DictDataTreeService,
];
