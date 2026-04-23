export const PRIMARY_HOST = 'www.aquadrop.hu';
export const PRIMARY_ORIGIN = `https://${PRIMARY_HOST}`;

export const toAbsoluteUrl = (path: string) => new URL(path, PRIMARY_ORIGIN).toString();
