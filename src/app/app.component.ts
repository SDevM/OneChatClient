import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'OneChatClient';
  msg = '';
  msgs: Message[] = [];
  constructor(private socketService: SocketService) {
    socketService.on('backlog', (msgStack: Message[]) => {
      this.msgs.push(...msgStack);
    });
    socketService.on('message', (new_msg: Message) => this.msgs.push(new_msg));
  }

  submit() {
    this.socketService.message(this.msg);
    this.msg = '';
  }
}

interface Message {
  id: string;
  owner: string;
  content: string;
}
