export enum API_TYPE {
  MOCK,
  LIVE,
}

export const API_URLS = {
  [API_TYPE.MOCK]:
    "https://stoplight.io/mocks/paddle/api-reference/30744711/2.0/subscription/users",
  [API_TYPE.LIVE]: "https://vendors.paddle.com/api/2.0/subscription/users",
};

export enum USERS_API_STATUS {
  Idle,
  Uploading,
}
