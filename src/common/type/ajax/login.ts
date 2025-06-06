export interface ILoginReq {
  phone: string;
  password: string;
}

export interface ILoginRes {
  userId: string;
  token: string;
}
export interface IUpdateInfoReq {
  nick_name?: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
}

