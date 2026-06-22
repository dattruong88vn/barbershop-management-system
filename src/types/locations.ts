export type Province = {
  code: string;
  name: string;
  fullName: string;
  type: string;
};

export type Ward = Province & {
  provinceCode: string;
};

export type ProvincesApiResponse = {
  provinces?: Province[];
  error?: string;
};

export type WardsApiResponse = {
  wards?: Ward[];
  error?: string;
};
