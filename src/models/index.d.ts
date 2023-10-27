export type Media = {
  id: string;
  name: string;
  type: 'image' | 'video';
  src: string | null;
  clickTrigger: number;
}