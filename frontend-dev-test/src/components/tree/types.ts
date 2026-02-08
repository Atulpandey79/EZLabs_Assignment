export type TreeNode = {
  id: string;
  name: string;
  color?: string;
 
  children?: TreeNode[];
  hasChildren?: boolean;
  isLoading?: boolean;
};

export type Path = number[]; 
