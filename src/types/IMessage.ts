import type IChat from './IChat';

export default interface IMessage {
  message_id: number;
  text?: string;

  chat: IChat;
}
