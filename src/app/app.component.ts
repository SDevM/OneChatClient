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
  name = 'Anon';
  msgs: Message[] = [];
  onlineList: string[] = [];
  constructor(private socketService: SocketService) {
    socketService.on('backlog', (msgStack: Message[]) => {
      if (msgStack) this.msgs = msgStack;
    });
    socketService.on('message', (new_msg: Message) => this.msgs.push(new_msg));
    socketService.on('online', (clients: string[]) => {
      console.log(clients);
      if (clients.length > 0) this.onlineList = clients;
    });
    socketService.name(this.name);
  }

  submit() {
    this.socketService.message(this.msg);
    this.msg = '';
  }
  rename() {
    this.socketService.name(this.name);
  }
}

interface Message {
  id: string;
  owner: string;
  content: string;
}
