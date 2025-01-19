export interface IGroupInfo {
  title: string;
  avatar: string;
  memberCount: number;
  conversationId: string;
}

export interface IGroupListRes {
  count: number;
  list: IGroupInfo[];
}