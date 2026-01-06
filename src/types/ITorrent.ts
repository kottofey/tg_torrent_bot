export default interface ITorrent {
  name: string;
  progress: number;
  total_size: number;
  hash: string;
}
