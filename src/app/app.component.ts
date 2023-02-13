import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
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
  onlineList: string[] = [];
  constructor(private socketService: SocketService) {
    socketService.on('backlog', (msgStack: Message[]) => {
      if (msgStack) this.msgs = msgStack;
    });
    socketService.on('message', (new_msg: Message) => this.msgs.push(new_msg));
    socketService.on('online', (clients: string[]) => {
      this.onlineList = clients;
    });
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
