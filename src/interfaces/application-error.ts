//eslint-disable-next-line
interface ApplicationError extends Error {
  info: string;
  status: number;
}
