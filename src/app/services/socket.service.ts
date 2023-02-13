import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  name: string = '';
  constructor(private socket: Socket) {
    this.name = prompt('Please enter your name: ') || 'Anon';
    socket.emit('name', this.name);
  }

  on(event: string, callback: Function) {
    this.socket.on(event, callback);
  }

  message(msg: string) {
    this.socket.emit('message', msg);
  }

  online() {
    this.socket.emit('online');
  }
}
